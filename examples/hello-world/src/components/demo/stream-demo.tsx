'use client';
import {
  experimental_streamedQuery as streamedQuery,
  useQuery,
} from '@tanstack/react-query';
import { StreamRPC } from '../../client/root'; // segmented client, just for demo

const StreamDemo = () => {
  const { data, refetch } = useQuery({
    queryKey: StreamRPC.streamTokens.queryKey(),
    queryFn: streamedQuery({
      streamFn: () => StreamRPC.streamTokens(),
    }),
  });

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: ignore for refetch demo
    // biome-ignore lint/a11y/useKeyWithClickEvents: ignore for refetch demo
    <div className="h-20 cursor-pointer" onClick={() => refetch()}>
      {data?.map((token, index) => (
        <span key={index}>{token.message}</span>
      ))}
    </div>
  );
};
export default StreamDemo;
