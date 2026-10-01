'use client';
import { BasicRPC, JSONLinesRPC } from '@/client';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  experimental_streamedQuery as streamedQuery,
} from '@tanstack/react-query';
import { useState } from 'react';

export function Example() {
  const query = useQuery({
    queryKey: BasicRPC.getHello.queryKey(),
    queryFn: () => BasicRPC.getHello(),
  });
  const stream = useQuery({
    queryKey: JSONLinesRPC.streamTokens.queryKey(['todo']),
    queryFn: streamedQuery({
      streamFn: () => JSONLinesRPC.streamTokens(),
    }),
  });
  const mutation = useMutation({
    mutationFn: BasicRPC.postHello,
  });

  const [userInput, setUserInput] = useState('');

  return (
    <div>
      <div>Query result: {query.data?.greeting ?? <em>Loading...</em>}</div>
      <div>
        Stream result: {stream.data?.map(({ message }, i) => <span key={i}>{message}</span>) ?? <em>Loading...</em>}
      </div>
      <div>
        Mutation result: {mutation.data?.greeting ?? (mutation.isPending ? <em>Loading...</em> : <em>None</em>)}
      </div>
      <div className="input-group">
        <input
          type="text"
          placeholder="Type a greeting..."
          value={userInput}
          onChange={(e) => setUserInput(e.currentTarget.value)}
        />
        <button type="button" onClick={() => mutation.mutate({ body: { greeting: userInput } })}>
          Mutate
        </button>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

export default function ReactQueryExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}
