import { EntityType } from '@prisma/client';
import { TaskSchema, UserSchema } from '@schemas/index';
import {
  get,
  JSONLinesResponder,
  prefix,
  procedure,
  type VovkIteration,
} from 'vovk';
import { z } from 'zod';
import { sessionGuard } from '@/decorators/session-guard';
import DatabasePollService from './database-poll-service';

@prefix('poll')
export default class DatabasePollController {
  @get()
  @sessionGuard()
  static poll = procedure({
    preferTransformed: false,
    iteration: z.union([
      z.object({
        id: z.uuid(),
        entityType: z.enum(EntityType),
        __isDeleted: z.boolean().optional(),
      }),
      UserSchema,
      TaskSchema,
    ]),
  }).handle(async (req) => {
    const responder = new JSONLinesResponder<
      VovkIteration<typeof DatabasePollController.poll>
    >(
      req,
      ({ readableStream, headers }) =>
        new Response(readableStream, { headers }),
    );

    void DatabasePollService.poll(responder);

    return responder;
  });
}
