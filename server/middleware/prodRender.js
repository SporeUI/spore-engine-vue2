const $fse = require('fs-extra');
const { createBundleRenderer } = require('vue-server-renderer');
const $getTemplatePath = require('../util/getTemplatePath');

const factory = (app) => {
  const {
    $logger,
    $render,
    config,
  } = app;
  $logger.debug('attach $prodRender');

  const serverBundleFile = app.$resolve(config.distServer);
  const clientBundleFile = app.$resolve(config.distClient);
  const $serverBundle = $fse.readJsonSync(serverBundleFile, 'utf8');
  const $clientManifest = $fse.readJsonSync(clientBundleFile, 'utf8');

  const templatePath = $getTemplatePath(app);
  const template = $fse.readFileSync(templatePath, 'utf8');

  const renderer = createBundleRenderer($serverBundle, {
    inject: false,
    runInNewContext: false,
    basedir: app.$resolve(config.basedir),
    // 页面模板
    template,
    // 客户端构建 manifest
    clientManifest: $clientManifest,
  });

  return async (context, next) => {
    const ctx = context;
    const { app } = ctx;

    let matched = true;
    if (typeof app.$match === 'function') {
      matched = await app.$match(ctx);
    }

    if (matched) {
      // 这里无需传入一个应用程序，因为在执行 bundle 时已经自动创建过。
      // 现在我们的服务器与应用程序已经解耦！
      ctx.body = await $render(ctx, renderer);
    }

    await next();
  };
};

module.exports = factory;
