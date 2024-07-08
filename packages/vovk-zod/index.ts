import { HttpException, HttpStatus, createDecorator } from 'vovk';
import { z } from 'zod';
import { default as zodToJsonSchema } from 'zod-to-json-schema';

type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

type ZodAny = z.ZodObject<KnownAny> | z.ZodRecord<KnownAny> | z.ZodUnion<KnownAny>;

const vovkZod = createDecorator(
  async (req, next, bodyModel?: ZodAny | null, queryModel?: ZodAny | null) => {
    if (bodyModel) {
      const body = await req.json();
      try {
        bodyModel.parse(body);
      } catch (e) {
        const err = (e as z.ZodError).errors.map((er) => `${er.message} (${er.path.join('/')})`).join(', ');
        throw new HttpException(HttpStatus.BAD_REQUEST, `Invalid body on server. ${err}`);
      }
      req.json = () => Promise.resolve(body);
    }

    if (queryModel) {
      const query = Object.fromEntries(req.nextUrl.searchParams.entries());
      delete query.nxtP;
      try {
        queryModel.parse(query);
      } catch (e) {
        const err = (e as z.ZodError).errors.map((er) => `${er.message} (${er.path.join('/')})`).join(', ');
        throw new HttpException(HttpStatus.BAD_REQUEST, `Invalid query on server. ${err}`);
      }
    }

    return next();
  },
  (bodyModel?: ZodAny | null, queryModel?: ZodAny | null) => {
    return (handlerMetadata) => ({
      ...handlerMetadata,
      customMetadata: {
        ...handlerMetadata?.customMetadata,
        [Symbol.for('zodBodyModel')]: bodyModel,
        [Symbol.for('zodQueryModel')]: queryModel,
      },
      clientValidators: {
        body: bodyModel ? zodToJsonSchema(bodyModel) : null,
        query: queryModel ? zodToJsonSchema(queryModel) : null,
      },
    });
  }
);

export default vovkZod;
