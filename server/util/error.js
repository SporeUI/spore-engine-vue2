const $fse = require('fs-extra');
const $template = require('lodash/template');
const $resolve = require('./resolve');

const tplErrorFile = $resolve('server/layout/error.html');

async function showError(err) {
  const ctx = this;
  const tplErrorStr = await $fse.readFile(tplErrorFile, 'utf8');
  const tplError = $template(tplErrorStr, {
    interpolate: (/{{([\s\S]+?)}}/g),
  });
  const useTpl = 1;
  if (useTpl) {
    ctx.status = err.status;
    ctx.type = 'text/html; charset=utf-8';
    ctx.body = tplError({
      message: err.message,
      stack: err.stack,
      status: err.status,
    });
  } else {
    ctx.throw(err.status, `${err.status} | ${err.message}\n\n${err.stack}`);
  }
}

// 统一处理错误信息
async function error(err) {
  const ctx = this;
  if (err.url) {
    ctx.redirect(err.url);
  } else if (err.code === 404) {
    ctx.throw(404, '404 | Page not found');
  } else {
    ctx.$logger.error(err);
    const error = err;
    error.status = 500;
    error.expose = true;
    await showError.call(this, error);
  }
}

module.exports = error;
