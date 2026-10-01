import { controllersToStaticParams, initSegment } from 'vovk';
import HelloController from '../../../modules/hello/hello-controller';

const controllers = { HelloRPC: HelloController };

export type Controllers = typeof controllers;

export const dynamic = 'force-static';

export function generateStaticParams() {
  return controllersToStaticParams(controllers);
}

export const { GET } = initSegment({
  controllers,
  onError: (error) => {
    console.error(error);
  },
});
