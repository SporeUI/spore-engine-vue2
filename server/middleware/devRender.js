const { createBundleRenderer } = require('vue-server-renderer');
const $setupDevServer = require('../../build/setup-dev-server');
const $getTemplatePath = require('../util/getTemplatePath');
const $updateRoutes = require('../util/updateRoutes');
const $resolve = require('../util/resolve');

const factory = (app) => {
  const {
    $logger,
    $render,
    config,
  } = app;

  $logger.debug('attach devRender');
  const templatePath = $getTemplatePath(app);
  $logger.info('template path:', templatePath);

  let renderer = null;

  const devServerReady = () => {
    $logger.info('devServerReady');
    $updateRoutes();
    $logger.info('routes updated');
    // In development: setup the dev server with watch and hot-reload,
    // and create a new renderer on bundle / index template update.
    return new Promise((resolve) => {
      $logger.info('start setupDevServer');
      $setupDevServer(app, {
        context: $resolve('.'),
        templatePath,
        onUpdate(rs) {
          $logger.info('devServer onUpdate');
          // 每次编译完后检查路由是否被更新过
          $updateRoutes();

          const {
            bundle,
            template,
            clientManifest,
          } = rs;

          $logger.info('devServer createRenderer');
          // 每次编译完毕后，都需要更新 render
          renderer = createRenderer(bundle, {
            template,
            clientManifest,
          });
          resolve(rs);
        },
      });
    });
  };

  // 让 hot middleware 提前注入到 app
  const devServerReadyPm = devServerReady();

  const createRenderer = function (bundle, options) {
    $logger.info('app createRenderer');
    // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
    return createBundleRenderer(bundle, Object.assign(options, {
      inject: false,
      runInNewContext: false,
      // this is only needed when vue-server-renderer is npm-linked
      basedir: app.$resolve(config.basedir),
    }));
  };

  const devRender = async (context, next) => {
    $logger.info('devRender start');
    const ctx = context;
    const { app } = ctx;

    let matched = true;
    if (typeof app.$match === 'function') {
      matched = await app.$match(ctx);
    }
    $logger.info('devRender after app.$match');

    if (matched) {
      $updateRoutes();
      $logger.info('devRender after updateRoutes');
      await devServerReadyPm;
      $logger.info('devRender after devServerReadyPm');
      // 这里无需传入一个应用程序，因为在执行 bundle 时已经自动创建过。
      // 现在我们的服务器与应用程序已经解耦！
      ctx.body = await $render(ctx, renderer);
      $logger.info('devRender render');
    }

    await next();
    $logger.info('devRender after next');
  };
  return devRender;
};

module.exports = factory;
