'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { StandardToolV0 } from 'vovk';
import { RealtimeRPC } from '@/client';

/**
 * Hook to manage a real-time session with OpenAI's Realtime endpoints.
 * @example const { isActive, isTalking, handleStartStopClick } = useWebRTCAudioSession(voice, tools);
 */
export default function useWebRTCAudioSession(
  voice: 'ash' | 'ballad' | 'coral' | 'sage' | 'verse',
  tools: StandardToolV0[],
) {
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  // Data channel ref
  const dcRef = useRef<RTCDataChannel | null>(null);
  // Media stream ref for microphone
  const mcRef = useRef<MediaStream | null>(null);
  // talking state + refs
  const [isTalking, setIsTalking] = useState(false);
  const remoteAnalyserRef = useRef<AnalyserNode | null>(null);
  const remoteMonitorIntervalRef = useRef<number | null>(null);
  const remoteAudioContextRef = useRef<AudioContext | null>(null);

  const startSession = useCallback(async () => {
    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Set up to play remote audio from the model
    audioElement.current = document.createElement('audio');
    audioElement.current.autoplay = true;
    pc.ontrack = (e) => {
      if (!audioElement.current) return;
      audioElement.current.srcObject = e.streams[0];
      // Simple audio activity monitor
      try {
        const audioCtx = new AudioContext();
        remoteAudioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(e.streams[0]);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        remoteAnalyserRef.current = analyser;
        remoteMonitorIntervalRef.current = window.setInterval(() => {
          if (!remoteAnalyserRef.current) return;
          const a = remoteAnalyserRef.current;
          const data = new Uint8Array(a.fftSize);
          a.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          setIsTalking(rms > 0.02); // simple threshold
        }, 200);
      } catch {
        // ignore audio activity errors
      }
    };

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    mcRef.current = ms;
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel('oai-events');
    dcRef.current = dc;

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const { sdp } = await RealtimeRPC.session({
      body: { sdp: offer.sdp ?? '' },
      query: { voice },
    });

    await pc.setRemoteDescription({
      type: 'answer',
      sdp,
    });
    dc.onopen = () => {
      const sessionUpdate = {
        type: 'session.update',
        session: {
          type: 'realtime',
          tools: tools.map(({ name, description, inputSchema }) => {
            // OpenAI wants bare JSON schema, drop the $schema marker zod adds
            const { $schema, ...parameters } =
              inputSchema?.['~standard'].jsonSchema.input({
                target: 'draft-2020-12',
              }) ?? {};
            return {
              name,
              description,
              parameters: inputSchema ? parameters : undefined,
              type: 'function',
            };
          }),
        },
      };
      dc.send(JSON.stringify(sessionUpdate));
    };
    dc.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      // Handle function call completions
      if (msg.type === 'response.function_call_arguments.done') {
        const execute = tools.find((tool) => tool.name === msg.name)?.execute;
        if (execute) {
          const args = JSON.parse(msg.arguments);
          const result = (await execute(args)) as {
            __preventResponseCreate?: boolean;
          };

          // Respond with function output
          const response = {
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: msg.call_id,
              output: JSON.stringify(result),
            },
          };
          dcRef.current?.send(JSON.stringify(response));

          if (!result?.__preventResponseCreate) {
            const responseCreate = {
              type: 'response.create',
            };
            dcRef.current?.send(JSON.stringify(responseCreate));
          }
        }
      }
    };
    setIsActive(true);
  }, [tools, voice]);

  const stopSession = useCallback(() => {
    // Close data channel and peer connection
    dcRef.current?.close();
    dcRef.current = null;
    // Stop microphone tracks
    mcRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    mcRef.current = null;
    // Close remote audio context
    remoteAudioContextRef.current?.close();
    remoteAudioContextRef.current = null;
    remoteAnalyserRef.current = null;
    // Stop the audio immediately
    if (audioElement.current) {
      audioElement.current.srcObject = null;
      audioElement.current = null;
    }
    // Clear monitoring interval
    if (remoteMonitorIntervalRef.current) {
      clearInterval(remoteMonitorIntervalRef.current);
      remoteMonitorIntervalRef.current = null;
    }
    setIsTalking(false);
    setIsActive(false);
  }, []);

  const toggleSession = useCallback(() => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
  }, [isActive, startSession, stopSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return {
    startSession,
    stopSession,
    toggleSession,
    isActive,
    isTalking,
  };
}
