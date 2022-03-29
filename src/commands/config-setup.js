import chalk from 'chalk';
import prompts from 'prompts';
import CLI from 'clui';

import * as config from '../util/config.js';

async function getAnswers(env) {
  env = env || {};

  const questions = [
    {
      type: 'text',
      name: 'baseUrl',
      message: 'What is your Tacton CPQ Admin base url?',
      initial: env.baseUrl || 'https://'
    },
    {
      type: 'text',
      name: 'ticketName',
      message: 'What is Tacton CPQ Admin ticket name?',
      initial: env.ticketName
    },
    {
      type: 'text',
      name: 'username',
      message: 'What is Tacton CPQ Admin username?',
      initial: env.username
    },
    {
      type: 'password',
      name: 'password',
      message: 'What is Tacton CPQ Admin password?',
      initial: env.password
    },
    {
      type: 'toggle',
      name: 'test',
      message: 'Should I test the connection?',
      initial: true
    }
  ];

  return await prompts(questions);
}

export default {
  command: 'setup [name]',
  desc: 'Setup configuration',
  builder: {},
  handler: async (argv) => {

    if (!argv.name) {
      console.log(`${chalk.red('Configuration name is required')}`);
      return;
    }

    console.log(`Setting up connection "${chalk.bold(argv.name)}"`);

    const env = config.get(argv.name);

    const response = await getAnswers(env);

    if (response.test) {
      const spinner = new CLI.Spinner(`Testing connection to ${chalk.bold(response.baseUrl)} as ${chalk.bold(response.username)}... `);
      try {
        spinner.start();

        await config.test(response);
        console.log(`${chalk.green('OK')}`);
        console.log(`${chalk.green('Configuration has been saved')}`);
        config.add(argv.name, response);
      } catch (e) {
        console.error(`${chalk.red(e)}`);
      } finally {
        spinner.stop();
      }
    } else {
      config.add(argv.name, response);
      console.log(`${chalk.yellow('Configuration has been saved without testing')}`);
    }

  }
}