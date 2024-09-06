import chalk from 'chalk';
import loglevel, { type LogLevelNames } from 'loglevel';
export default function getLogger(level: LogLevelNames) {
  const log = {
    info: (msg: string) => loglevel.info(chalk.cyanBright(`🐺 ${msg}`)),
    warn: (msg: string) => loglevel.warn(chalk.yellowBright(`🐺 ${msg}`)),
    error: (msg: string) => loglevel.error(chalk.redBright(`🐺 ${msg}`)),
    debug: (msg: string) => loglevel.debug(chalk.gray(`🐺 ${msg}`)),
    raw: loglevel,
  };

  loglevel.setLevel(level);

  return log;
}
