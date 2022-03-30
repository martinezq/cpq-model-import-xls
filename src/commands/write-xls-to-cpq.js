import chalk from 'chalk';
import prompts from 'prompts';
import CLI from 'clui';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

import * as config from '../util/config.js'

import * as convert_v1 from '../util/convert-xls-to-cpq.js';
import * as convert_v2 from '../util/convert-xls-to-cpq-v2.js';
import * as read_v1 from '../util/read-cpq-to-xls.js';
import * as read_v2 from '../util/read-cpq-to-xls-v2.js';

import { merge } from '../util/merge-cpq.js';
import { createRemote } from '../util/promo-api.js';

export default {
  command: 'xls-to-cpq [file] [conf] [ver]',
  desc: 'Write from xlsx file to CPQ',
  builder: {},
  handler: async (argv) => {

    if (!argv.file) {
      console.log(`${chalk.red('File name is required')}`);
      return;
    }

    if (!argv.conf) {
      console.log(`${chalk.red('Config name is required')}`);
      return;
    }

    argv.ver = argv.ver || 'v1'

    if (!(argv.ver === 'v1' || argv.ver === 'v2')) {
      console.log(`${chalk.red('Unsupported version ' + argv.ver)}`);
      return;
    }

    const { readCpq } = argv.ver === 'v1' ? read_v1 : read_v2;
    const { convertXlsToCPQ } = argv.ver === 'v1' ? convert_v1 : convert_v2;

    try {
      const conf = config.get(argv.conf);

      const spinner = new CLI.Spinner(`Reading file "${chalk.bold(argv.file)}"... `);

      spinner.start();
      
      const data = await convertXlsToCPQ(argv.file, { 
        selectWorksheet: true,
        selectWorksheetFunc: async (names) => {
          const response = await prompts({
            type: 'select',
            name: 'value',
            message: `Select sheet`,
            initial: 0,
            choices: names.map(n => ({ title: n, value: n }))
          });

          return response.value;
        }
      });

      console.log(`${chalk.green('OK')}`);

      const debugDir = '_debug';

      if (!existsSync(debugDir)) {
        mkdirSync(debugDir, { recursive: true });
      }

      writeFileSync(`${debugDir}/promo_data_from_xls.json`, JSON.stringify(data, null, 2));      

      spinner.message('Loading current data from CPQ');

      const oldData = await readCpq(conf);

      writeFileSync(`${debugDir}/promo_data_from_cpq.json`, JSON.stringify(oldData, null, 2));      

      const mergedData = merge(oldData, data);

      writeFileSync(`${debugDir}/promo_data_merged.json`, JSON.stringify(mergedData, null, 2));      

      spinner.stop();

      const response = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Import to CPQ ticket ${conf.ticketName} with content of ${argv.file}? (${mergedData.modules.length} modules with total ${mergedData.variants.length} variants will be recreated)`,
        initial: false
      });

      if (response.value) {
        const { modules, features, variants } = mergedData;

        console.log(`${chalk.green(`Replacing ${mergedData.modules.length} modules`)}`);
    
        await createRemote(conf, 'module', {
            moduleList: modules,
            featureList: features,
            variantList: variants
        })

        console.log(`${chalk.green(`Data has been updated`)}`);
      }

    } catch (e) {
      console.error(e);
    }    
  }
}