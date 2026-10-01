import { headers } from 'next/headers';
import Image from 'next/image';
import Demo from '@/components/demo';

export default async function Home() {
  const isIframe = (await headers()).get('sec-fetch-dest') === 'iframe';
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen font-(family-name:--font-geist-sans) max-w-full">
      <main className="flex flex-col gap-8 row-start-2 items-center justify-items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={160}
            height={38}
            priority
          />
          <span className="text-4xl">+</span>
          <Image
            className="dark:invert"
            src="https://vovk.dev/vovk-logo.svg"
            alt="Vovk.ts logo"
            width={160}
            height={38}
            priority
          />
        </div>

        <div
          className={`
          w-96
          font-(family-name:--font-geist-mono)
          text-sm

          [&_form_>_div]:w-full 
          [&_form_>_div]:grid 
          [&_form_>_div]:justify-items-stretch 
          [&_form_>_div]:grid-cols-2 
          [&_form_>_div]:my-2 

          [&_h3]:font-bold

          [&_label]:flex
          [&_label]:text-sm
          [&_label]:items-center 
          
          [&_input]:text-sm
          [&_input]:p-1.5 
          [&_input]:border
          [&_input]:border-gray-100
          [&_input]:outline-none 
          [&_input]:rounded-sm 
          dark:[&_input]:bg-gray-100
          dark:[&_input]:border-none 
          dark:[&_input]:text-black 

          [&_select]:text-sm
          [&_select]:p-1.5 
          [&_select]:border
          [&_select]:border-gray-100
          [&_select]:outline-none 
          [&_select]:rounded-sm 
          dark:[&_select]:bg-gray-100
          dark:[&_select]:border-none 
          dark:[&_select]:text-black 

          **:[[type="checkbox"]]:mr-2

          [&_button]:rounded-full 
          [&_button]:border border-solid 
          [&_button]:border-transparent 
          [&_button]:transition-colors 
          [&_button]:flex 
          [&_button]:items-center 
          [&_button]:justify-center 
          [&_button]:bg-foreground 
          [&_button]:text-background 
          [&_button]:hover:bg-[#383838] 
          [&_button]:dark:hover:bg-[#ccc] 
          [&_button]:text-sm 
          [&_button]:sm:text-base 
          [&_button]:h-10 
          [&_button]:sm:h-12 
          [&_button]:px-6
          [&_button]:sm:px-10
          [&_button]:mx-auto
          [&_button]:mt-8

          [&_output]:max-w-full
          [&_output]:block
          [&_output_div]:max-w-full
          [&_output_div]:overflow-auto
          [&_output_div]:relative
        `}
        >
          <Demo />
        </div>
        {!isIframe && (
          <>
            <div className="grid grid-cols-2 gap-4 w-full place-items-center">
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://vovk.dev/hello-world"
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
                More&nbsp;Info
              </a>
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="/openapi"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/scalar.svg"
                  alt="Scalar icon"
                  width={16}
                  height={16}
                />
                OpenAPI Spec
              </a>
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://github.com/finom/vovk/tree/main/examples/hello-world"
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
                Github&nbsp;Repo
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
            <div className="grid grid-cols-3 gap-4 w-full place-items-center">
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://npmjs.com/package/vovk-hello-world"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/npm.svg"
                  alt="NPM icon"
                  width={16}
                  height={16}
                />
                On NPM
              </a>
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://crates.io/crates/vovk_hello_world"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/rust.svg"
                  alt="Rust icon"
                  width={16}
                  height={16}
                />
                On Crates
              </a>
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://pypi.org/project/vovk-hello-world"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/pypi.svg"
                  alt="PyPI icon"
                  width={16}
                  height={16}
                />
                On PyPI
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
