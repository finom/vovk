'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { CustomerProRPC } from '@/client/customer/pro';
import Demo from '@/components/demo';

export default function ProCustomerTenantPage() {
  const params = useParams<{ customer_name: string }>();

  const { data } = useQuery({
    queryKey: CustomerProRPC.getMessage.queryKey(),
    queryFn: () =>
      CustomerProRPC.getMessage({
        transform: (d, resp) => [d, resp] as const,
      }),
  });

  const [responseData, response] = data || [null, null];

  return (
    <Demo
      tenantName={`"${params.customer_name}" Pro Customer`}
      response={response}
      data={responseData}
    />
  );
}
