import { PrismaNeon } from '@prisma/adapter-neon';
import { Prisma, PrismaClient } from '@prisma/client';
import { HttpException, HttpStatus } from 'vovk';
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
              let result: BaseEntity | BaseEntity[];
              try {
                result = (await query(args)) as BaseEntity | BaseEntity[];
              } catch (error) {
                throw DatabaseService.toHttpException(error, model);
              }

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

  // a missing record, a taken unique value or a missing related record is the caller's error, not a 500
  private static toHttpException(error: unknown, model: string) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return error;
    switch (error.code) {
      case 'P2025':
        return new HttpException(HttpStatus.NOT_FOUND, `${model} not found`);
      case 'P2002':
        return new HttpException(
          HttpStatus.CONFLICT,
          `${model} with the same unique field already exists`,
        );
      case 'P2003':
        return new HttpException(
          HttpStatus.BAD_REQUEST,
          `${model} refers to a record that doesn't exist`,
        );
      default:
        return error;
    }
  }
}
