import Link from 'next/link';
import type { UrlObject } from 'node:url';

const IFrame = (props: React.IframeHTMLAttributes<HTMLIFrameElement>) => {
  return (
    <div className="border rounded-md border-gray-300 dark:border-neutral-700 mt-2 overflow-hidden">
      <div className="px-4 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-900 flex items-center h-10 rounded-t-md">
        <Link href={props.src as unknown as UrlObject} target="_blank" className="dark:text-white underline">
          {props.src}
        </Link>
      </div>
      <iframe {...props} />
    </div>
  );
};

export default IFrame;
