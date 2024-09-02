import { createDecorator, get } from 'vovk';

const customSchema = createDecorator(null, (hello: 'world') => {
  return (handlerSchema) => {
    return {
      ...handlerSchema,
      customSchema: {
        ...handlerSchema?.customSchema,
        hello,
      },
    };
  };
});

export default class CostomSchemaController {
  // The endpoint itself isn't going to be tested, it modifies .vovk.json that in its turn is tested
  @get.auto()
  @customSchema('world')
  static getWithCustomSchema() {
    return null;
  }
}
