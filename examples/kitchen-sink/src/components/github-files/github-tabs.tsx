'use client';
import { useState } from 'react';
import type { GithubFile } from '@/types.ts';

interface Props {
  githubFiles: GithubFile[];
  owner: string;
  repo: string;
  ghRef: string;
  id: string;
}

const GithubTabs = ({ githubFiles, owner, repo, ghRef, id }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="pb-2 px-4 text-sm mb-1">
      {githubFiles.map(({ path }, i) => (
        <div key={path} className={`inline-block mr-4 mb-1`}>
          <button
            title={path}
            type="button"
            className={`pb-0.5 cursor-pointer border-b-2 border-solid ${
              i === activeIndex
                ? 'text-neutral-900 border-blue-500 dark:text-gray-100 dark:border-slate-500'
                : 'text-slate-400 dark:text-[#525975] border-transparent'
            }`}
            onClick={() => {
              document.querySelectorAll(`#${id} .github-tab-content`).forEach((el) => {
                el.classList[el.id === `tab-${id}-${i}` ? 'remove' : 'add']('hidden');
              });
              setActiveIndex(i);
            }}
          >
            {path.split('/').pop()}
          </button>
          <a
            className="inline-block align-middle ml-1"
            href={`https://github.com/${owner}/${repo}/tree/${ghRef}/${path}`}
            target="_blank"
            title="View on GitHub"
            rel="noopener"
          >
            <svg
              width="16"
              height="16"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>View on GitHub</title>
              <path
                d="M14 11.9976C14 9.5059 11.683 7 8.85714 7C8.52241 7 7.41904 7.00001 7.14286 7.00001C4.30254 7.00001 2 9.23752 2 11.9976C2 14.376 3.70973 16.3664 6 16.8714C6.36756 16.9525 6.75006 16.9952 7.14286 16.9952"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 11.9976C10 14.4893 12.317 16.9952 15.1429 16.9952C15.4776 16.9952 16.581 16.9952 16.8571 16.9952C19.6975 16.9952 22 14.7577 22 11.9976C22 9.6192 20.2903 7.62884 18 7.12383C17.6324 7.04278 17.2499 6.99999 16.8571 6.99999"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      ))}
    </div>
  );
};

export default GithubTabs;
