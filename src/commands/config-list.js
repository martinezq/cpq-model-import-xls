import * as config from '../util/config.js';

export default {
  command: 'list',
  desc: 'List all configurations',
  builder: {},
  handler: async (argv) => {
    console.log('Configurations: ', config.list());
  }
}