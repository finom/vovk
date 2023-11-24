import { isEqual } from 'lodash';
import { HttpException, HttpStatus, SmoothieRequest, createDecorator } from '../../../src';
import { SmoothieClientOptions } from '../../../src/client';

type BodyValidate = Record<string, unknown> | null;
type QueryValidate = Record<string, string> | null;

const validateEquality = createDecorator(
  async (req: SmoothieRequest<unknown>, next, bodyValidate?: BodyValidate, queryValidate?: QueryValidate) => {
    if (bodyValidate) {
      const body = await req.json();

      // override req.json to make it to be called again by controller code
      req.json = () => Promise.resolve(body);

      if (!isEqual(body, bodyValidate)) {
        throw new HttpException(HttpStatus.BAD_REQUEST, 'Server exception. Invalid body');
      }
    }

    if (queryValidate) {
      const query = Object.fromEntries(req.nextUrl.searchParams.entries());

      if (!isEqual(query, queryValidate)) {
        throw new HttpException(HttpStatus.BAD_REQUEST, 'Server exception. Invalid query');
      }
    }

    return next();
  },
  (bodyValidate?: BodyValidate, queryValidate?: QueryValidate) => ({
    clientValidators: {
      body: bodyValidate,
      query: queryValidate,
    },
  })
);

export const validateEqualityOnClient: SmoothieClientOptions['validateOnClient'] = (input, validators) => {
  if (validators.body) {
    if (!isEqual(input.body, validators.body)) {
      throw new HttpException(HttpStatus.NULL, `Client exception. Invalid body`);
    }
  }

  if (validators.query) {
    if (!isEqual(input.query, validators.query)) {
      throw new HttpException(HttpStatus.NULL, `Client exception. Invalid query`);
    }
  }
};

export default validateEquality;
