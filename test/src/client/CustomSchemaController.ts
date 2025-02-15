import { createDecorator, get } from 'vovk';

const custom = createDecorator(null, (hello: 'world') => {
  return (handlerSchema) => {
    return {
      ...handlerSchema,
      custom: {
        ...handlerSchema?.custom,
        hello,
      },
    };
  };
});

export default class CustomSchemaController {
  // The endpoint itself isn't going to be tested, it modifies .vovk.json that in its turn is tested
  @get.auto()
  @custom('world')
  static getWithCustomSchema() {
    return null;
  }
}
