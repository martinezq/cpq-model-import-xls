import chalk from 'chalk';

import * as config from '../util/config.js'
import { readCpq, saveGlobalFeaturesXls } from '../util/read-cpq-to-xls.js';

export default {
  command: 'cpq-to-xls [conf] [file]',
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

    try {
      const conf = config.get(argv.conf);
      const { moduleData, globalFeatureData } = await readCpq(conf);
      
      await saveGlobalFeaturesXls(moduleData, globalFeatureData, argv.file)

    } catch (e) {
      console.error(e);
    }
  }
}
