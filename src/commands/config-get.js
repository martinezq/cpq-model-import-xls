import chalk from 'chalk';

import * as config from '../util/config.js';

export default {
  command: 'get [name]',
  desc: 'Get configuration',
  builder: {},
  handler: async (argv) => {

    if (!argv.name) {
      console.log(`${chalk.red('Configuration name is required')}`);
      return;
    }

    const env = config.get(argv.name);

    if (!env) {
      console.log(`${chalk.yellow('Configuration does not exist')}`);
      return;
    }

    env.password = '<hidden>';

    console.log(env);
  }
}