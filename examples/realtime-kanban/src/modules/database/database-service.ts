import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import type { BaseEntity } from '@/types';
import DatabaseEventsService, {
  type DBChange,
} from './database-events-service';
import './neon-local'; // Setup Neon for local development

export default class DatabaseService {
  static get prisma() {
    DatabaseService.#prisma ??= DatabaseService.getClient();
    return DatabaseService.#prisma;
  }
  static #prisma: ReturnType<typeof DatabaseService.getClient> | null = null;

  private static getClient() {
    const prisma = new PrismaClient({
      adapter: new PrismaNeon({
        connectionString: `${process.env.DATABASE_URL}`,
      }),
    });

    DatabaseEventsService.beginEmitting();

    return prisma
      .$extends({
        name: 'timestamps',
        // Ensure createdAt and updatedAt are always ISO strings to match the generated Zod schemas
        result: {
          $allModels: {
            createdAt: {
              compute: (data: { createdAt: Date }) =>
                data.createdAt.toISOString(),
            },
            updatedAt: {
              compute: (data: { updatedAt: Date }) =>
                data.updatedAt.toISOString(),
            },
          },
        },
      })
      .$extends({
        name: 'events',
        // Emit database change events for create, update, and delete operations
        query: {
          $allModels: {
            async $allOperations({ model, operation, args, query }) {
              const allowedOperations = [
                'create',
                'update',
                'delete',
                'upsert',
                'findMany',
                'findUnique',
                'findFirst',
                'findUniqueOrThrow',
                'findFirstOrThrow',
                'count',
                'aggregate',
                'groupBy',
              ] as const;
              type AllowedOperation = (typeof allowedOperations)[number];
              if (!allowedOperations.includes(operation as AllowedOperation)) {
                throw new Error(
                  `Unsupported database operation "${operation}" on model "${model}"`,
                );
              }
              const result = (await query(args)) as BaseEntity | BaseEntity[];

              const now = new Date().toISOString();
              let change: DBChange | null = null;

              const makeChange = (
                entity: BaseEntity,
                type: DBChange['type'],
              ) => ({
                id: entity.id,
                entityType: entity.entityType,
                date:
                  type === 'delete'
                    ? now
                    : entity.updatedAt
                      ? new Date(entity.updatedAt).toISOString()
                      : now,
                type,
              });

              switch (operation as AllowedOperation) {
                case 'create':
                  if ('entityType' in result)
                    change = makeChange(result, 'create');
                  break;

                case 'update':
                case 'upsert':
                  if ('entityType' in result)
                    change = makeChange(result, 'update');
                  break;

                case 'delete':
                  if ('entityType' in result) {
                    change = makeChange(result, 'delete');
                    // Automatically add __isDeleted flag to deletion results
                    Object.assign(result, { __isDeleted: true });
                  }
                  break;

                case 'findMany':
                case 'findUnique':
                case 'findFirst':
                case 'findUniqueOrThrow':
                case 'findFirstOrThrow':
                case 'count':
                case 'aggregate':
                case 'groupBy':
                  // no events
                  break;

                default:
                  console.warn(
                    `Unhandled Prisma operation: ${operation} for model: ${model}`,
                  );
                  break;
              }

              if (change) {
                await DatabaseEventsService.createChanges([change]);
              }

              return result;
            },
          },
        },
      });
  }
}
