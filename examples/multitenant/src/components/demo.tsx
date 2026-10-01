import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';

interface Props {
  tenantName: string;
  response: Response | null;
  data: { message: string; subdomains: Record<string, string> } | null;
}

const TenantLink = ({ href }: { href: string }) => {
  return (
    <a
      href={href}
      className="block border border-dashed dark:border-white/30 border-black/30 rounded-full py-1 px-3 mb-2 overflow-hidden text-ellipsis whitespace-nowrap hover:bg-black/5 dark:hover:bg-white/10 transition"
    >
      {href.replace(/^https?:\/\//, '')}
    </a>
  );
};

const Tenants = () => {
  return (
    <div className="text-center w-full">
      <h2 className="text-md mb-2 font-semibold">All tenants:</h2>
      <TenantLink href="https://multitenant.vovk.dev" />
      <TenantLink href="https://admin.multitenant.vovk.dev" />
      <TenantLink href="https://customer.multitenant.vovk.dev" />
      <TenantLink href="https://acme.customer.multitenant.vovk.dev" />
      <TenantLink href="https://pro.acme.customer.multitenant.vovk.dev" />
    </div>
  );
};

const Demo = ({ tenantName, response, data }: Props) => (
  <div className="text-sm/6 max-w-full w-[610px] mx-auto flex items-center justify-items-stretch min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-mono)]">
    <main className="flex flex-1 flex-col gap-6 row-start-2 items-center justify-items-stretch sm:items-start">
      <div className="mx-auto text-center">
        <Image
          className="dark:invert"
          src="https://vovk.dev/vovk-logo.svg"
          alt="Vovk.ts logo"
          width={319.95556 / 1.4}
          height={92 / 1.4}
          priority
        />
        <div className="text-xs opacity-50">Multitenancy demo</div>
      </div>
      <div className="text-center sm:text-left self-stretch">
        <h1 className="text-lg mb-4 font-semibold text-center">
          Welcome to the {tenantName} page
        </h1>
        {data ? (
          <div className="mb-2 tracking-[-.01em]">
            Endpoint{' '}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              {response?.url}
            </code>{' '}
            responded with message{' '}
            <strong className="font-semibold">
              &quot;{data.message}&quot;
            </strong>
            {Object.keys(data?.subdomains).length > 0 ? (
              <>
                {' '}
                and subdomain list{' '}
                <strong className="font-semibold">
                  {JSON.stringify(data.subdomains, null, 1)}
                </strong>
              </>
            ) : (
              ''
            )}
            . Open devtools to see the request and response details.
          </div>
        ) : (
          <Skeleton count={3} containerClassName="w-full" />
        )}
      </div>

      <div className="flex flex-row justify-between w-full">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vovk.dev/multitenant"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          More&nbsp;info
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/finom/vovk/tree/main/examples/multitenant"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/github-mark.svg"
            alt="Github icon"
            width={16}
            height={16}
          />
          Github&nbsp;repo
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vovk.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          vovk.dev
        </a>
      </div>

      <Tenants />
    </main>
  </div>
);

export default Demo;
