import GithubTabs from './github-tabs.tsx';
import type { GithubFile } from '@/types.ts';
import CodeBlock from './code-block.tsx';
import { useId } from 'react';
import Link from 'next/link.js';

interface Props {
  githubFiles: GithubFile[];
  owner: string;
  repo: string;
  ghRef: string;
  highlightLines?: number[];
  cutLines?: (number | [number, number])[];
}

const GithubCode = ({ githubFiles, owner, repo, ghRef, highlightLines, cutLines }: Props) => {
  const id = useId(); // Ensure unique IDs for tabs
  return (
    <div className={`bg-code rounded-lg mt-4`} id={id}>
      <GithubTabs githubFiles={githubFiles} owner={owner} repo={repo} ghRef={ghRef} id={id} />
      {githubFiles.map(({ content }, i) => (
        <div key={i} className={`h-full github-tab-content ${i ? 'hidden' : ''}`} id={`tab-${id}-${i}`}>
          <CodeBlock lineNumbers highlightLines={highlightLines} cutLines={cutLines}>
            {content.trim()}
          </CodeBlock>
          <Link
            href={`https://github.com/${owner}/${repo}/blob/${ghRef}/${githubFiles[i].path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 x:focus-visible:nextra-focus x:text-primary-600 x:underline x:hover:no-underline x:decoration-from-font x:[text-underline-position:from-font]"
          >
            View {githubFiles[i].path.split('/').pop()} file on GitHub
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
              viewBox="0 0 24 24"
              height="1em"
              className="x:inline x:align-baseline x:shrink-0"
            >
              <title>View on GitHub</title>
              <path d="M7 17L17 7"></path>
              <path d="M7 7h10v10"></path>
            </svg>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default GithubCode;
