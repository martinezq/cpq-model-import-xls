import configClear from './config-clear.js';
import configList from './config-list.js';
import configDel from './config-del.js';
import configGet from './config-get.js';
import configSetup from './config-setup.js';

export default {
  command: 'config',
  desc: 'Manage configurations',
  builder: (yargs) => yargs
    .command(configList)
    .command(configSetup)
    .command(configGet)
    .command(configDel)
    .command(configClear)
    .demandCommand()
    .help()
    .argv
}