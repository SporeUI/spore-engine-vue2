const $fse = require('fs-extra');
const $resolve = require('./resolve');
const $cwd = require('./cwd');

// 获取模板文件路径
function getTemplatePath() {
  let templatePath = '';
  const defaultTemplatePath = $resolve('server/template.html');
  templatePath = defaultTemplatePath;

  const appTemplatePath = $cwd('src/template.html');
  if ($fse.existsSync(appTemplatePath)) {
    templatePath = appTemplatePath;
  }
  return templatePath;
}

module.exports = getTemplatePath;
