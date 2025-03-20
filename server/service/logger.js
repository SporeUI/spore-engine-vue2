const $logger = require('colorogger');

const logger = new $logger({
  meta: {
    module: 'service',
  },
});

module.exports = logger;
