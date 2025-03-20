const $fse = require('fs-extra');

const $logger = require('../service/logger');
const $resolve = require('./resolve');
const $cwd = require('./cwd');

// 记录路由信息的虚拟文件
const routesFile = $resolve('temp/pages_routes.js');
const hookFile = $resolve('temp/hook.js');
const cwdHookFile = $cwd('src/hook.js');

let cachePageList = '';

function changeFileSync(file, content) {
  if ($fse.existsSync(file)) {
    const preContent = $fse.readFileSync(file, 'utf8');
    if (preContent !== content) {
      $fse.writeFileSync(file, content, 'utf8');
    }
  } else {
    $fse.ensureFileSync(file);
    $fse.writeFileSync(file, content, 'utf8');
  }
}

function updateHook() {
  let strHook = '';
  if ($fse.existsSync(cwdHookFile)) {
    strHook = `
    import $hook from '${cwdHookFile}';
    hook = $hook;
    `;
  }
  const hookContent = `
let hook = function() {};
${strHook}
export default hook;
  `;
  changeFileSync(hookFile, hookContent);
}

// 用虚拟文件系统存储路由文件
function updateRoutes() {
  updateHook();
  const pagesDir = process.env.PAGES_DIR || 'src/pages';
  const allPages = process.env.PAGES || '';
  const dirPages = $cwd(pagesDir);
  let pages = [];
  if ($fse.existsSync(dirPages)) {
    pages = $fse.readdirSync(dirPages);
  }

  let pageMap = null;
  if (allPages) {
    pageMap = {};
    const arrAllPages = allPages.split(',');
    arrAllPages.forEach((name) => {
      pageMap[name] = true;
    });
  }

  const strPageList = pages.join();

  if (strPageList !== cachePageList) {
    $logger.info('pages directory:', dirPages);
    if (cachePageList) {
      $logger.warn('pages changed, will reload ...');
      // reload app
      // https://github.com/remy/nodemon#controlling-shutdown-of-your-script
      setTimeout(() => {
        process.kill(process.pid, 'SIGUSR2');
      }, 1000);
    }
    cachePageList = strPageList;

    const arrRoutes = [];
    pages.forEach((pageName) => {
      // 忽略隐藏文件与目录
      if (pageName.indexOf('.') === 0) return;
      if (pageMap && !pageMap[pageName]) {
        $logger.warn('ignore page:', pageName);
        return;
      }
      $logger.success('load page:', pageName);
      const pageRoute = `
        import ${pageName} from '${dirPages}/${pageName}';
        routes.push({
          path: '/${pageName}',
          alias: [
            '**/${pageName}',
            '**/${pageName}.html',
          ],
          component: ${pageName},
        });
      `;
      arrRoutes.push(pageRoute);
    });

    const routesContent = arrRoutes.join('\n');
    const routesFileContent = `
      const routes = [];
      ${routesContent}
      export default routes;
    `;

    $logger.info('pages routes file:', routesFile);
    changeFileSync(routesFile, routesFileContent);
  }

  if (!strPageList) {
    const routesFileContent = `
      const routes = [];
      export default routes;
    `;
    changeFileSync(routesFile, routesFileContent);
  }
}

module.exports = updateRoutes;
