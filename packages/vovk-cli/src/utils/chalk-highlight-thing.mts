import chalk from 'chalk';

export function chalkHighlightThing(str: string) {
  return chalk.whiteBright.bold(str);
}
