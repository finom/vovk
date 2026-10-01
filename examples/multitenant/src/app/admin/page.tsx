'use client';
import { useQuery } from '@tanstack/react-query';
import { AdminRPC } from '@/client';
import Demo from '@/components/demo';

export default function AdminTenantPage() {
  const { data } = useQuery({
    queryKey: AdminRPC.getMessage.queryKey(),
    queryFn: () =>
      AdminRPC.getMessage({
        transform: (d, resp) => [d, resp] as const,
      }),
  });

  const [responseData, response] = data || [null, null];

  return <Demo tenantName="Admin" response={response} data={responseData} />;
}
