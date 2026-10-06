'use client';
import { useQuery } from '@tanstack/react-query';
import { CustomerRPC } from '@/client/customer';
import Demo from '@/components/demo';

export default function CustomerTenantPage() {
  const { data } = useQuery({
    queryKey: CustomerRPC.getMessage.queryKey(),
    queryFn: () =>
      CustomerRPC.getMessage({
        transform: (d, resp) => [d, resp] as const,
      }),
  });

  const [responseData, response] = data || [null, null];

  return <Demo tenantName="Customer" response={response} data={responseData} />;
}
