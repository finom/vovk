'use client';

import { usePathname } from 'next/navigation.js';

const HomeLink = () => {
  const pathname = usePathname();

  return (
    <a
      href="/"
      className={`text-black dark:text-white mt-4 ${pathname === '/' ? 'hidden' : 'inline-block'}`}
      title="Home"
    >
      <svg
        width="24px"
        height="24px"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Home</title>
        <path
          d="M21 12L3 12M3 12L11.5 3.5M3 12L11.5 20.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
};

export default HomeLink;
