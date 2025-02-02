import { useEffect } from 'react';
import { ClientControllerRPC } from 'vovk-client';

const UseQueryComponent = () => {
  const useQueryResult = ClientControllerRPC.postWithAll.useQuery({
    queryKey: ['postWithAll'],
    params: { hello: 'world' },
    body: { isBody: true },
    query: { simpleQueryParam: 'queryValue' },
  });

  useEffect(() => {
    (
      window as typeof window & {
        useQueryResult: typeof useQueryResult;
      }
    ).useQueryResult = useQueryResult;
  }, [useQueryResult]);

  return null;
};

export default UseQueryComponent;
