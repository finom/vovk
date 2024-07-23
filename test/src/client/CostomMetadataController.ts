import { createDecorator, get } from 'vovk';

const customMetadata = createDecorator(null, (hello: 'world') => {
  return (handlerMetadata) => {
    return {
      ...handlerMetadata,
      customMetadata: {
        ...handlerMetadata?.customMetadata,
        hello,
      },
    };
  };
});

export default class CostomMetadataController {
  // The endpoint itself isn't going to be tested, it modifies .vovk.json that in its turn is tested
  @get.auto()
  @customMetadata('world')
  static getWithCustomMetadata() {
    return null;
  }
}
