import chalk from 'chalk';
import loglevel, { type LogLevelNames } from 'loglevel';

const brackets = chalk.hex('#dd4115').bold;
export const logPrefix = `${brackets('[[')}${chalk.bold('v')}${brackets(']]')}`;

export function getLogger(level: LogLevelNames) {
  const log = {
    info: (msg: string) => loglevel.info(`${logPrefix} ${chalk.white(msg)}`),
    warn: (msg: string) => loglevel.warn(`${logPrefix} ${chalk.yellowBright(msg)}`),
    error: (msg: string) => loglevel.error(`${logPrefix} ${chalk.redBright(msg)}`),
    debug: (msg: string) => loglevel.debug(`${logPrefix} ${chalk.gray(msg)}`),
    raw: loglevel,
  };

  loglevel.setLevel(level);

  return log;
}
