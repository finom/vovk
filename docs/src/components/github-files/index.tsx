import { getGithubFiles } from 'vovk-examples';
import GithubCode from './github-code';

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
  try {
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
  } catch (e) {
    return <div>Error loading GitHub files: {(e as Error).message}</div>;
  }
}
