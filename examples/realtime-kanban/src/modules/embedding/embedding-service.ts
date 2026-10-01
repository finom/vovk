import { openai } from '@ai-sdk/openai';
import { Prisma } from '@prisma/client';
import type { EntityType } from '@schemas/index';
import type { TaskType } from '@schemas/models/Task.schema';
import type { UserType } from '@schemas/models/User.schema';
import { embed } from 'ai';
import { capitalize, omit } from 'lodash';
import { BASE_KEYS } from '@/constants';
import DatabaseService from '../database/database-service';

export default class EmbeddingService {
  static async generateEmbedding(value: string): Promise<number[]> {
    const { embedding } = await embed({
      model: openai.embeddingModel('text-embedding-3-small'),
      value,
    });

    return embedding;
  }

  static generateEntityEmbedding = async (
    entityType: EntityType,
    entityId: UserType['id'] | TaskType['id'],
  ) => {
    const entity = await DatabaseService.prisma[
      entityType as 'user'
    ].findUnique({
      where: { id: entityId },
    });
    const capitalizedEntityType = capitalize(entityType);
    if (!entity) throw new Error(`${capitalizedEntityType} not found`);

    const embedding = await this.generateEmbedding(
      Object.values(omit(entity, BASE_KEYS))
        .filter((v) => typeof v === 'string')
        .join(' ')
        .trim()
        .toLowerCase(),
    );

    await DatabaseService.prisma.$executeRawUnsafe(
      `
    UPDATE "${capitalizedEntityType}" 
    SET embedding = $1::vector
    WHERE id = $2
    `,
      `[${embedding.join(',')}]`,
      entityId,
    );

    return embedding;
  };

  static async vectorSearch<T>(
    entityType: EntityType,
    query: string,
    limit: number = 10,
    similarityThreshold: number = 0.4,
  ) {
    const queryEmbedding = await EmbeddingService.generateEmbedding(
      query.trim().toLowerCase(),
    );
    const capitalizedEntityType = capitalize(entityType);

    // find similar vectors and return entity IDs
    const vectorResults = await DatabaseService.prisma.$queryRaw<
      { id: string; similarity: number }[]
    >`
    SELECT
      id,
      1 - (embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector) as similarity
    FROM ${Prisma.raw(`"${capitalizedEntityType}"`)}
    WHERE embedding IS NOT NULL
      AND 1 - (embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector) > ${similarityThreshold}
    ORDER BY embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector
    LIMIT ${limit}
  `;

    return DatabaseService.prisma[entityType as 'user'].findMany({
      where: {
        id: {
          in: vectorResults.map((r) => r.id as string),
        },
      },
    }) as Promise<T[]>;
  }
}
