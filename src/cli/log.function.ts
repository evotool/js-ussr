import isString from 'lodash/isString';
import { inspect } from 'util';

export function log(...args: any[]): void {
  process.stdout.write(
    `${new Date().toISOString()} ${args
      .map((arg) => isString(arg) ? arg : inspect(arg, false, null, true))
      .join(' ')}\n`,
  );
}
