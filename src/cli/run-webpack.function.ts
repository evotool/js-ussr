import { type MultiStats, webpack } from 'webpack';

import { log } from './log.function';
import { WEBPACK_STATS, makeConfig } from './make-config.function';
import { onExit } from './on-exit.function';

type SomeError = Error & {
  [key: string]: any;
};

export function runWebpack(watch: boolean, mode: string, cwd: string): void {
  const compiler = webpack(makeConfig(mode, cwd));

  if (watch) {
    log(`Start watching in ${mode} mode`);

    const watching = compiler.watch(
      {},
      (err: SomeError | null | undefined, stats: MultiStats | undefined) => {
        if (err) {
          log(err);

          return;
        }

        log(stats!.toString(WEBPACK_STATS));
      },
    );

    onExit(async (signal) => {
      log('Stop watching', signal);

      try {
        await new Promise<void>((r, t) => watching.close((e) => e ? t(e) : r()));
        log('Watching successfully closed');
      } catch (err) {
        log('Watching error:', err);
      }

      process.exit();
    });

    return;
  }

  log(`Start building in ${mode} mode`);

  compiler.run((err: SomeError | null | undefined, stats: MultiStats | undefined) => {
    if (err) {
      log(err.stack || err);

      if (err.details) {
        log(err.details);
      }

      return;
    }

    log(stats!.toString(WEBPACK_STATS));
  });

  onExit(async (signals) => {
    log('Stop compiler', signals);

    try {
      await new Promise<void>((r, t) => compiler.close((e) => e ? t(e) : r()));
      log('Compiler successfully closed');
    } catch (err) {
      log('Compiler error:', err);
    }

    process.exit();
  });
}
