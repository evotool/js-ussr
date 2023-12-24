#!/usr/bin/env node

import { program } from 'commander';

import { runWebpack } from './run-webpack.function';

program
  .option('--watch', 'Watch mode', false)
  .option('--host <string>', 'Host', '127.0.0.1')
  .option('--port <number>', 'Port', '3000')
  .option('--mode <string>', 'Env mode', process.env.NODE_ENV || 'development')
  .option('--cwd <string>', 'A directory to use instead of $PWD.', process.cwd())
  .action((options) => {
    const { watch, mode = 'development', cwd } = options;

    runWebpack(watch, mode, cwd);
  })
  .on('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .version('0.1.1');

program.parse(process.argv);
