import chalk from 'chalk';

export default function chalkHighlightThing(str: string) {
  return chalk.cyan.bold(str);
}
