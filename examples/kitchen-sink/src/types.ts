import type { Metadata } from 'next';

export type PageMetadata = Omit<Metadata, 'title' | 'description'> & {
  title: string;
  description: string;
};

export type GithubFile = {
  path: string;
  content: string;
};
