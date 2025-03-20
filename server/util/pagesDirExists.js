const $fse = require('fs-extra');
const $cwd = require('./cwd');
const $logger = require('../service/logger');

const defaultDirPages = 'src/pages';

module.exports = function () {
  const pagesDir = process.env.PAGES_DIR || defaultDirPages;
  process.env.PAGES_DIR = pagesDir;

  const fullPagesDir = $cwd(pagesDir);
  if (!$fse.existsSync(fullPagesDir)) {
    $logger.log('find pages directory:', fullPagesDir);
    $logger.fail('pages directory not exists in current project');
    return false;
  }

  return true;
};
