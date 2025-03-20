const $error = require('../util/error');

const factory = (app) => {
  app.$logger.debug('attach $error');
  return async (context, next) => {
    const ctx = context;
    ctx.$error = $error;
    try {
      await next();
    } catch (err) {
      await ctx.$error(err);
    }
    ctx.$error = null;
  };
};

module.exports = factory;
