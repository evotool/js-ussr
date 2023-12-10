#!/usr/bin/env node

import { program } from 'commander';
import webpack from 'webpack';

import { makeConfig } from './make-config';

program
  .option('--watch', 'Watch mode', false)
  .option('--host <string>', 'Host', '127.0.0.1')
  .option('--port <number>', 'Port', '3000')
  .option('--mode <string>', 'Env mode', process.env.NODE_ENV || 'development')
  .option('--cwd <string>', 'A directory to use instead of $PWD.', process.cwd())
  .action((_, options) => {
    const { watch, mode = 'development', cwd } = options;
    const compiler = webpack(makeConfig(mode, cwd));

    if (watch) {
      compiler.watch({}, (err, stats) => {
        if (err || stats?.hasErrors()) {
          console.error(err, stats);
        }
      });

      return;
    }

    compiler.run((err, stats) => {
      if (err || stats?.hasErrors()) {
        console.error(err, stats);

        return;
      }

      compiler.close((closeErr) => {
        if (closeErr) {
          console.error(closeErr);
        }
      });
    });
  });
