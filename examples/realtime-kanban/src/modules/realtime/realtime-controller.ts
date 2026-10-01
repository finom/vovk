import { HttpException, HttpStatus, post, prefix, procedure } from 'vovk';
import { z } from 'zod';
import { sessionGuard } from '@/decorators/session-guard';

@prefix('realtime')
export default class RealtimeController {
  @post('session')
  @sessionGuard()
  static session = procedure({
    query: z.object({
      voice: z.enum(['ash', 'ballad', 'coral', 'sage', 'verse']),
    }),
    body: z.object({ sdp: z.string() }),
    output: z.object({ sdp: z.string() }),
  }).handle(async ({ vovk }) => {
    const { voice } = vovk.query();
    const { sdp: sdpOffer } = await vovk.body();
    const sessionConfig = JSON.stringify({
      type: 'realtime',
      model: 'gpt-realtime',
      audio: { output: { voice } },
    });

    const fd = new FormData();
    fd.set('sdp', sdpOffer);
    fd.set('session', sessionConfig);

    try {
      const r = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: fd,
      });
      // Send back the SDP we received from the OpenAI REST API
      const sdp = await r.text();
      return { sdp };
    } catch (error) {
      throw new HttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to generate token. ${String(error)}`,
      );
    }
  });
}
