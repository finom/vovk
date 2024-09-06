import chalk from 'chalk';

export default function formatLoggedSegmentName(segmentName: string, withChalk = false) {
  const text = segmentName ? `segment "${segmentName}"` : 'the root segment';

  return withChalk ? chalk.white.bold(text) : text;
}
