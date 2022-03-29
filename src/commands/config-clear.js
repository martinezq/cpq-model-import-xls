import chalk from 'chalk';
import prompts from 'prompts';

import * as configuration from '../util/config.js';

export default {
    command: 'clear',
    desc: 'Clear all configurations',
    builder: {},
    handler: async (argv) => {
        const response = await prompts({
            type: 'confirm',
            name: 'value',
            message: 'Remove all configurations?',
            initial: false
          });

        if (response.value) {
            configuration.clear();
            console.log(`${chalk.green('All configurations has been removed')}`);
        }
    }
  }