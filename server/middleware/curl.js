const $curl = require('../util/curl');

const factory = (app) => {
  app.$logger.debug('attach $curl');
  return async (context, next) => {
    const ctx = context;
    ctx.$curl = $curl;
    await next();
    ctx.$curl = null;
  };
};

module.exports = factory;
