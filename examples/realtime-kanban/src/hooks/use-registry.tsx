'use client';
import { EntityType } from '@prisma/client';
import type { TaskType } from '@schemas/models/Task.schema';
import type { UserType } from '@schemas/models/User.schema';
import fastDeepEqual from 'fast-deep-equal';
import { type ReactNode, createContext, useContext, useRef } from 'react';
import { type StoreApi, createStore, useStore } from 'zustand';
import { fetcher } from '@/lib/fetcher';
import type { BaseEntity } from '../types';

interface Registry {
  [EntityType.user]: Record<UserType['id'], UserType>;
  [EntityType.task]: Record<TaskType['id'], TaskType>;
  parse: (data: unknown) => void;
}

const MAX_DEPTH = 10;

export function getEntitiesFromData(
  data: unknown,
  entities: Partial<{
    [key in EntityType]: Record<BaseEntity['id'], BaseEntity>;
  }> = {},
  depth = 0,
) {
  if (depth > MAX_DEPTH) return entities as Partial<Omit<Registry, 'parse'>>;

  if (Array.isArray(data)) {
    data.forEach((item) => {
      getEntitiesFromData(item, entities, depth + 1);
    });
  } else if (typeof data === 'object' && data !== null) {
    Object.values(data).forEach((value) => {
      getEntitiesFromData(value, entities, depth + 1);
    });
    if ('entityType' in data && 'id' in data) {
      const entityType = data.entityType as EntityType;
      const id = (data as BaseEntity).id;
      entities[entityType] ??= {};
      entities[entityType][id] = data as BaseEntity;
    }
  }
  return entities as Partial<Omit<Registry, 'parse'>>;
}

function createRegistryStore(initialData: {
  users?: UserType[];
  tasks?: TaskType[];
}) {
  const initialEntities = getEntitiesFromData(initialData);

  return createStore<Registry>((set) => ({
    [EntityType.user]: (initialEntities.user ?? {}) as Record<
      UserType['id'],
      UserType
    >,
    [EntityType.task]: (initialEntities.task ?? {}) as Record<
      TaskType['id'],
      TaskType
    >,
    parse: (data) => {
      const entities = getEntitiesFromData(data);
      set((state) => {
        const newState: Record<string, unknown> = {};
        let isChanged = false;
        Object.entries(entities).forEach(([entityType, entityMap]) => {
          const type = entityType as EntityType;
          const descriptors = Object.getOwnPropertyDescriptors(
            state[type] ?? {},
          );
          let areDescriptorsChanged = false;
          Object.values(entityMap).forEach((entity) => {
            const descriptorValue = descriptors[entity.id]?.value;
            const value = { ...descriptorValue, ...entity };
            const isCurrentChanged = !fastDeepEqual(descriptorValue, value);
            descriptors[entity.id] = isCurrentChanged
              ? ({
                  value,
                  configurable: true,
                  writable: false,
                  enumerable: !('__isDeleted' in entity),
                } satisfies PropertyDescriptor)
              : descriptors[entity.id];
            areDescriptorsChanged ||= isCurrentChanged;
          });
          newState[type] = areDescriptorsChanged
            ? Object.defineProperties({}, descriptors)
            : state[type];
          isChanged ||= areDescriptorsChanged;
        });
        return isChanged ? { ...state, ...newState } : state;
      });
    },
  }));
}

const RegistryContext = createContext<StoreApi<Registry> | null>(null);

export function RegistryProvider({
  initialData,
  children,
}: {
  initialData: { users?: UserType[]; tasks?: TaskType[] };
  children: ReactNode;
}) {
  const storeRef = useRef<StoreApi<Registry> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createRegistryStore(initialData);
    const { parse } = storeRef.current.getState();

    fetcher.onSuccess((data, { bypassRegistry }) => {
      if (bypassRegistry) return;

      if (
        data &&
        typeof data === 'object' &&
        Symbol.asyncIterator in data &&
        'onIterate' in data &&
        typeof data.onIterate === 'function'
      ) {
        data.onIterate(parse);
      }

      parse(data);
    });
  }

  return (
    <RegistryContext.Provider value={storeRef.current}>
      {children}
    </RegistryContext.Provider>
  );
}

export function useRegistryStore() {
  const store = useContext(RegistryContext);
  if (!store)
    throw new Error('useRegistry must be used within RegistryProvider');
  return store;
}

export function useRegistry<T>(selector: (state: Registry) => T): T {
  return useStore(useRegistryStore(), selector);
}
