const $cwd = require('./util/cwd');

// 挂载中间件，挂载全局事件
async function init(app) {
  const isDev = process.env.NODE_ENV === 'development';

  // 挂载中间件
  const use = (name) => {
    const factory = app.$middlewares[name];
    if (typeof factory === 'function') {
      app.use(factory(app));
    } else {
      app.$logger.error(`middlare ${name} is not a function`);
    }
  };

  app.$logger.info('root:', app.$resolve('.'));
  app.$logger.info('cwd:', $cwd('.'));

  use('logger');
  use('error');
  use('curl');

  // 配置静态服务
  app.$static(app);

  // 页面渲染
  if (isDev) {
    use('devRender');
  } else {
    use('prodRender');
  }

  return app;
}

module.exports = init;
