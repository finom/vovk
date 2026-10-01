import type { GithubFile } from '@/types.ts';

async function performDirectGithubRequest(
  path: string,
  { owner, repo, ref }: { owner: string; repo: string; ref: string }
) {
  const resp = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}?t=${Date.now()}`);
  return resp.text();
}

export async function getGithubFile(path: string, { owner, repo, ref }: { owner: string; repo: string; ref: string }) {
  let resp: Response;

  try {
    resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}&t=${Date.now()}`, {
      headers: {
        Accept: 'application/vnd.github.VERSION.raw',
      },
    });
  } catch {
    // fallback in case if API limmit is exceeded
    return performDirectGithubRequest(path, { owner, repo, ref });
  }

  if (resp.status !== 200) {
    return performDirectGithubRequest(path, { owner, repo, ref });
  }

  return resp.text();
}

export default async function getGithubFiles(
  githubPaths: string[],
  { owner, repo, ref }: { owner: string; repo: string; ref: string }
): Promise<GithubFile[]> {
  const githubContents = await Promise.all(githubPaths.map((path) => getGithubFile(path, { owner, repo, ref })));
  const githubFiles = githubContents.map((content, i) => ({ path: githubPaths[i], content }));

  return githubFiles;
}
