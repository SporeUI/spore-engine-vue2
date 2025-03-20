const $del = require('del');
const $fetch = require('node-fetch');
const $fse = require('fs-extra');
const $service = require('../server');
const $resolve = require('../server/util/resolve');
const $pagesDirExists = require('../server/util/pagesDirExists');
const $logger = require('../server/service/logger');
const $cwd = require('../server/util/cwd');

async function print() {
  $logger.info('print start');
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  const port = Number(process.env.PORT) || 8090;
  const isProd = process.env.NODE_ENV === 'production';
  const allPages = process.env.PAGES || '';

  if (!$pagesDirExists()) {
    $logger.fail('require pages dir');
    return;
  }

  if (!isProd) {
    $logger.fail('print must run at production mode');
    return;
  }

  const dirCache = $resolve('node_modules/.cache');
  await $del([dirCache], {
    force: true,
  });
  $logger.info('node_modules/.cache cleared');

  const app = $service({
    root: $resolve('.'),
    port,
  });

  app.init();
  const server = await app.start();
  $logger.info('server started');

  let arrAllPages = allPages.split(',');
  arrAllPages = arrAllPages.filter(name => (!!name));

  if (arrAllPages.length > 0) {
    arrAllPages.forEach((name) => {
      $logger.info(`Will print page: dist/client/${name}.html`);
    });
    const pmList = arrAllPages.map(async (name) => {
      const url = `http://127.0.0.1:${port}/${name}`;
      const response = await $fetch(url);
      const html = await response.text();
      const distFile = $cwd(`dist/client/${name}.html`);
      await $fse.writeFile(distFile, html, 'utf8');
      $logger.success(`Print page: dist/client/${name}.html success`);
      return Promise.resolve();
    });
    await Promise.all(pmList);
    $logger.info('print task done');
  } else {
    $logger.fail('None page selected');
  }

  server.close();
}

module.exports = print;
