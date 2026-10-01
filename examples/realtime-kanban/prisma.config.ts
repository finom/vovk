import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {},
  datasource: {
    url: env('DATABASE_URL_UNPOOLED'),
  },
});
