import writeXlsToCpq from './write-xls-to-cpq.js';


export default {
  command: 'write',
  desc: 'Write model data',
  builder: (yargs) => yargs
    .command(writeXlsToCpq)
    .demandCommand()
    .help()
    .argv
}