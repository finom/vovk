import type { EntityType } from '@prisma/client';

export interface BaseEntity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  entityType: EntityType;
}
