import chalk from 'chalk';
import CLI from 'clui';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

import * as config from '../util/config.js'

import * as read_v1 from '../util/read-cpq-to-xls.js';
import * as read_v2 from '../util/read-cpq-to-xls-v2.js';


export default {
  command: 'cpq-to-xls [conf] [file] [ver]',
  desc: 'Reads model data from CPQ and saves it into Excel file',
  builder: {},
  handler: async (argv) => {

    if (!argv.conf) {
      console.log(`${chalk.red('Config name is required')}`);
      return;
    }

    if (!argv.file) {
      console.log(`${chalk.red('File name is required')}`);
      return;
    }

    argv.ver = argv.ver || 'v1'

    if (!(argv.ver === 'v1' || argv.ver === 'v2')) {
      console.log(`${chalk.red('Unsupported version ' + argv.ver)}`);
      return;
    }

    const { readCpq, saveXls } = argv.ver === 'v1' ? read_v1 : read_v2;

    try {
      const conf = config.get(argv.conf);

      const spinner = new CLI.Spinner(`Reading data from ${chalk.bold(conf.baseUrl)}, ticket ${chalk.bold(conf.ticketName)}... `);

      spinner.start();
      
      const data = await readCpq(conf);
      
      const debugDir = '_debug';

      if (!existsSync(debugDir)) {
        mkdirSync(debugDir, { recursive: true });
      }
      
      writeFileSync(`${debugDir}/promo_data_from_cpq.json`, JSON.stringify(data, null, 2));  

      spinner.message(`Saving result to ${chalk.bold(argv.file)}`);

      const { moduleData, globalFeatureData } = data;
      await saveXls(moduleData, globalFeatureData, argv.file)

      spinner.stop();

      console.log(`${chalk.green(`Data has been saved to ${chalk.bold(argv.file)}`)}`);

    } catch (e) {
      console.error(e);
    }
  }
}
