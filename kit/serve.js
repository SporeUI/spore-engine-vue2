const $del = require('del');
const $service = require('../server');
const $resolve = require('../server/util/resolve');
const $pagesDirExists = require('../server/util/pagesDirExists');
const $cwd = require('../server/util/cwd');
const $logger = require('../server/service/logger');

async function serve() {
  $logger.info('serve start');
  const port = Number(process.env.PORT) || 8090;
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }

  const isProd = process.env.NODE_ENV === 'production';

  if (!$pagesDirExists()) {
    $logger.fail('require pages dir');
    return;
  }

  const dirCwdDist = $cwd('dist');
  const dirCache = $resolve('node_modules/.cache');
  const dirDist = $resolve('dist');
  const delList = [];
  delList.push(dirCache);
  if (!isProd) {
    // 开发模式下，移除 dist 目录
    delList.push(dirDist);
    delList.push(dirCwdDist);
  }

  await $del(delList, {
    force: true,
  });
  $logger.info('dist cleared');
  $logger.info('node_modules/.cache cleared');

  const app = $service({
    root: $resolve('.'),
    port,
  });

  app.init();
  app.start();
  return app;
}

serve();
