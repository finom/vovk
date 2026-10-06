'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { CustomerRPC } from '@/client/customer';
import Demo from '@/components/demo';

export default function SpecificCustomerTenantPage() {
  const params = useParams<{ customer_name: string }>();

  const { data } = useQuery({
    queryKey: CustomerRPC.getMessage.queryKey(),
    queryFn: () =>
      CustomerRPC.getMessage({
        transform: (d, resp) => [d, resp] as const,
      }),
  });

  const [responseData, response] = data || [null, null];

  return (
    <Demo
      tenantName={`"${params.customer_name}" Customer`}
      response={response}
      data={responseData}
    />
  );
}
