import { neonConfig } from '@neondatabase/serverless';

if (!process.env.VERCEL_ENV) {
  neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}
