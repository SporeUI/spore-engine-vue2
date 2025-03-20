const $fse = require('fs-extra');
const $execa = require('execa');
const $del = require('del');

const $resolve = require('../server/util/resolve');
const $cwd = require('../server/util/cwd');
const $updateRoutes = require('../server/util/updateRoutes');
const $pagesDirExists = require('../server/util/pagesDirExists');

const dirClient = $resolve('dist/client');
const cwdDirClient = $cwd('dist/client');

async function build() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  if (!process.env.BUILD_CWD) {
    process.env.BUILD_CWD = process.cwd();
  }

  if (!$pagesDirExists()) {
    return;
  }

  $updateRoutes();

  const dirCwdDist = $cwd('dist');
  const dirCache = $resolve('node_modules/.cache');
  const dirDist = $resolve('dist');
  await $del([dirCache, dirDist, dirCwdDist], {
    force: true,
  });

  await $execa('npx', [
    'vue-cli-service',
    'build',
  ], {
    cwd: $resolve('.'),
    stdio: 'inherit',
  });

  $fse.ensureDirSync(dirCwdDist);
  $fse.copySync(dirClient, cwdDirClient);

  await $execa('npx', [
    'vue-cli-service',
    'build',
    '--mode',
    'server',
  ], {
    extendEnv: true,
    env: {
      WEBPACK_TARGET: 'node',
    },
    cwd: $resolve('.'),
    stdio: 'inherit',
  });
}

module.exports = build;
