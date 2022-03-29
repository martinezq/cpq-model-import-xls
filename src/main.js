#!/usr/bin/env node

import yargs from 'yargs';

import config from './commands/config.js';
import read from './commands/read.js';
import write from './commands/write.js';

yargs(process.argv.slice(2))
  .command(config)
  .command(read)
  .command(write)
  .demandCommand()
  .help()
  .argv