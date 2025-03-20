function wrapTag(tag, key) {
  let val = '';
  if (key === 'ctx') {
    val = '';
  } else {
    val = `[${tag}]`;
  }
  return val;
}

function getCtxLogger(ctx, logger, options) {
  const conf = {
    module: 'context',
    ...options,
  };
  return logger.fork({
    wrapTag,
    meta: {
      ctx,
      module: conf.module,
      url: ctx.url,
      guid: ctx.guid,
    },
  });
}

module.exports = getCtxLogger;
