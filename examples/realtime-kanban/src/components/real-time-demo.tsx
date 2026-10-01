'use client';
import { useRouter } from 'next/navigation';
import { standardTool } from 'standard-tool';
import { deriveTools } from 'vovk';
import { TaskRPC, UserRPC } from '@/client';
import z from 'zod';
import useWebRTCAudioSession from '@/hooks/use-web-rtc-audio-session';
import { getCurrentTime } from '@/lib/tools/get-current-time';
import { getVisiblePageSection } from '@/lib/tools/get-visible-page-section';
import { partyMode } from '@/lib/tools/party-mode';
import { scroll } from '@/lib/tools/scroll';
import Floaty from './floaty';
import { useMemo } from 'react';

const RealTimeDemo = () => {
  const router = useRouter();

  const tools = useMemo(
    () => [
      ...deriveTools({
        modules: { TaskRPC, UserRPC },
      }),
      standardTool({
        name: 'getCurrentTime',
        description: "Gets the current time in the user's timezone",
        outputSchema: z
          .object({
            time: z.string(),
            timezone: z.string(),
            message: z.string(),
          })
          .meta({ description: 'Current time info.' }),
        execute: getCurrentTime,
      }),
      standardTool({
        name: 'partyMode',
        description: 'Triggers a confetti animation on the page',
        execute: partyMode,
      }),
      standardTool({
        name: 'navigateTo',
        description:
          'Navigates the user to a specified URL within the application.',
        inputSchema: z.object({
          url: z
            .enum(['/', '/openapi'])
            .meta({ description: 'The URL to navigate to.' }),
        }),
        outputSchema: z
          .string()
          .meta({ description: 'Navigation confirmation message.' }),
        execute: async ({ url }: { url: string }) => {
          router.push(url);
          return `Navigating to ${url}`;
        },
      }),
      standardTool({
        name: 'scroll',
        description: 'Scrolls the page up or down.',
        inputSchema: z.object({
          direction: z
            .enum(['up', 'down'])
            .meta({ description: 'The direction to scroll' }),
          px: z.number().optional().meta({
            description:
              'The number of pixels to scroll. If not provided, scrolls by one viewport height.',
          }),
        }),
        outputSchema: z.object({
          message: z
            .string()
            .meta({ description: 'Scroll action confirmation message.' }),
          __preventResponseCreate: z
            .boolean()
            .meta({ description: 'Flag to prevent response creation.' }),
        }),
        execute: scroll,
      }),
      standardTool({
        name: 'getVisiblePageSection',
        description: 'Gets the currently visible section of the page',
        outputSchema: z
          .string()
          .meta({ description: 'Visible text content from the page.' }),
        execute: getVisiblePageSection,
      }),
    ],
    [router.push],
  );

  const { isActive, isTalking, toggleSession } = useWebRTCAudioSession(
    'ash',
    tools,
  );

  return (
    <Floaty
      isActive={isActive}
      isTalking={isTalking}
      handleClick={toggleSession}
    />
  );
};

export default RealTimeDemo;
