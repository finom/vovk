CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "embedding" vector(1536);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "embedding" vector(1536);
