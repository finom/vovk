import chalk from 'chalk';

export default function chalkHighlightThing(str: string) {
  return chalk.whiteBright.bold(str);
}
