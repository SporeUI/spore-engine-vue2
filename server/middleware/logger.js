const $getRnd36 = require('@spore-ui/kit/packages/str/getRnd36');
const $getTime36 = require('@spore-ui/kit/packages/str/getTime36');
const $getCtxLogger = require('../util/getCtxLogger');

const factory = (app) => {
  const { $logger } = app;
  $logger.debug('attach $logger');
  return async (context, next) => {
    const ctx = context;
    ctx.guid = `ctx_${$getTime36()}_${$getRnd36()}`;
    ctx.$logger = $getCtxLogger(ctx, $logger, {
      module: 'context',
    });
    await next();
    ctx.$logger.destroy();
    ctx.$logger = null;
  };
};

module.exports = factory;
