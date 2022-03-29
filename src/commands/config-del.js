import chalk from 'chalk';
import prompts from 'prompts';

import * as config from '../util/config.js';

export default {
  command: 'del [name]',
  desc: 'Delete configuration',
  builder: {},
  handler: async (argv) => {

    if (!argv.name) {
      console.log(`${chalk.red('Configuration name is required')}`);
      return;
    }

    const response = await prompts({
      type: 'confirm',
      name: 'value',
      message: `Remove configuration "${argv.name}"?`,
      initial: false
    });

    if (response.value) {
      config.del(argv.name);
      console.log(`${chalk.green('Configuration has been removed')}`);
    }
  }
}