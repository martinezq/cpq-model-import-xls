import readFromCpqToXls from './read-cpq-to-xls.js';

export default {
  command: 'read',
  desc: 'Read model data',
  builder: (yargs) => yargs
    .command(readFromCpqToXls)
    .demandCommand()
    .help()
    .argv
}