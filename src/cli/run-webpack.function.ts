import { webpack } from 'webpack';

import { makeConfig } from './make-config.function';

export function runWebpack(watch: boolean, mode: string, cwd: string): void {
  const compiler = webpack(makeConfig(mode, cwd));

  if (watch) {
    compiler.watch({}, (err, stats) => {
      if (err || stats?.hasErrors()) {
        console.error(err, stats);
      }

      console.log(stats?.toString());
    });

    return;
  }

  compiler.run((err, stats) => {
    if (err || stats?.hasErrors()) {
      console.error(err, stats);

      return;
    }

    console.log(stats?.toString());

    compiler.close((closeErr, result) => {
      if (closeErr) {
        console.error(closeErr);

        return;
      }

      console.log({ result });
    });
  });
}
