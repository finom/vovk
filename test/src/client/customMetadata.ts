import { VovkRequest, createDecorator } from '../../../src';

const customMetadata = createDecorator(
  // TODO Minor issue: init function still requires the arg to be defined in the handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: VovkRequest<unknown>, next, _hello: 'world') => next(),
  (hello: 'world') => {
    return (handlerMetadata) => {
      return {
        ...handlerMetadata,
        customMetadata: {
          ...handlerMetadata?.customMetadata,
          hello,
        },
      };
    };
  }
);

export default customMetadata;
