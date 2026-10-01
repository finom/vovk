'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StreamDemo from './stream-demo';
import UserFormDemo from './user-form-demo';

const queryClient = new QueryClient();

const Demo = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <StreamDemo />
      <h2 className="text-lg font-bold mb-1 text-center">
        &quot;Update User&quot; Demo
      </h2>
      <p className="text-xs mb-4 text-center">
        <strong>*</strong> form validation isn&apos;t enabled for demo purposes
      </p>
      <UserFormDemo />
    </QueryClientProvider>
  );
};

export default Demo;
