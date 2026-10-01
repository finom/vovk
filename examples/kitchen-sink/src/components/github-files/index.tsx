import getGithubFiles from '../../lib/get-github-files.ts';
import GithubCode from './github-code.tsx';

interface Props {
  paths: string[];
  owner?: string;
  repo?: string;
  ghRef?: string;
  highlightLines?: number[];
  cutLines?: (number | [number, number])[];
}

export default async function GithubFiles({
  paths,
  owner = 'finom',
  repo = 'vovk',
  ghRef = 'main',
  highlightLines,
  cutLines,
}: Props) {
  const githubFiles = await getGithubFiles(paths, { owner, repo, ref: ghRef });
  return (
    <GithubCode
      githubFiles={githubFiles}
      owner={owner}
      repo={repo}
      ghRef={ghRef}
      highlightLines={highlightLines}
      cutLines={cutLines}
    />
  );
}
