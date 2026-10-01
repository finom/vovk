import { initSegment } from 'vovk';

import OpenAiController from '../../../modules/openai/openai-controller.ts';
import BasicController from '../../../modules/basic/basic-controller.ts';
import BasicControllerWithService from '../../../modules/basic-with-service/basic-controller-with-service.ts';
import JSONLinesController from '../../../modules/jsonlines/json-lines-controller.ts';
import JSONLinesResponderController from '../../../modules/jsonlines-responder/json-lines-responder-controller.ts';
import AiSdkController from '../../../modules/ai-sdk/ai-sdk-controller.ts';
import ProxyController from '../../../modules/proxy/proxy-controller.ts';
import UserZodController from '../../../modules/zod/user-zod-controller.ts';
import PollController from '../../../modules/polling/poll-controller.ts';
import UserArktypeController from '../../../modules/arktype/user-arktype-controller.ts';
import UserValibotController from '../../../modules/valibot/user-valibot-controller.ts';
import ProgressiveController from '../../../modules/progressive/progressive-controller.ts';
import UserZodWithServiceController from '../../../modules/zod-with-service/user-zod-with-service-controller.ts';
import FormZodController from '../../../modules/form/form-zod-controller.ts';
import EventsController from '@/modules/events/events-controller.ts';

export const maxDuration = 60;

const controllers = {
  UserZodRPC: UserZodController,
  UserZodWithServiceRPC: UserZodWithServiceController,
  UserArktypeRPC: UserArktypeController,
  UserValibotRPC: UserValibotController,
  BasicRPC: BasicController,
  BasicRPCWithService: BasicControllerWithService,
  JSONLinesRPC: JSONLinesController,
  JSONLinesResponderRPC: JSONLinesResponderController,
  OpenAiRPC: OpenAiController,
  AiSdkRPC: AiSdkController,
  ProxyRPC: ProxyController,
  PollRPC: PollController,
  EventsRPC: EventsController,
  ProgressiveRPC: ProgressiveController,
  FormZodRPC: FormZodController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PUT, DELETE, HEAD, OPTIONS } = initSegment({
  controllers,
  onError: (error) => {
    console.error('Segment error: ', error);
  },
});
