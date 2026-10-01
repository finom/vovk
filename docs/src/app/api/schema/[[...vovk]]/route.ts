import { controllersToStaticParams, initSegment } from 'vovk';
import V3SchemaController from '../../../../modules/schema/v3-schema-controller';

const controllers = { V3SchemaRPC: V3SchemaController };

export type Controllers = typeof controllers;

export const dynamic = 'force-static';

export function generateStaticParams() {
  return controllersToStaticParams(controllers);
}

export const { GET } = initSegment({
  segmentName: 'schema',
  controllers,
  onError: (error) => {
    console.error(error);
  },
});
