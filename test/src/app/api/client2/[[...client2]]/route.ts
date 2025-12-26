import { initSegment, cloneControllerMetadata, prefix, get } from 'vovk';
import CommonController from '../../../../client/CommonController.ts';

@cloneControllerMetadata()
@prefix('common2')
class ClonedCommonController extends CommonController {
  @get.auto()
  static extraClonedControllerMethod() {
    return { hello: 'world from client2' };
  }
}

const controllers = {
  CommonControllerDifferentFetcherRPC: ClonedCommonController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'client2',
  controllers,
  onError: (err, req) => {
    // eslint-disable-next-line no-console
    console.log('onError', err.message, req.url);
  },
});
