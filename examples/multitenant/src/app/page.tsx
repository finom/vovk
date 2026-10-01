'use client';
import { useQuery } from '@tanstack/react-query';
import { RootRPC } from '@/client';
import Demo from '@/components/demo';

export default function RootTenantPage() {
  const { data } = useQuery({
    queryKey: RootRPC.getMessage.queryKey(),
    queryFn: () =>
      RootRPC.getMessage({
        transform: (d, resp) => [d, resp] as const,
      }),
  });

  const [responseData, response] = data || [null, null];

  return <Demo tenantName="Home" response={response} data={responseData} />;
}
