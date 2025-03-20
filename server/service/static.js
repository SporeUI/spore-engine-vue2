const $koaStatic = require('koa-static');
const $favicon = require('koa-favicon');

// 引入静态文件
const configStatic = (app) => {
  const conf = app.config;
  $favicon(conf.favicon);

  let list = [];
  if (typeof conf.static === 'string') {
    list.push(conf.static);
  } else if (Array.isArray(conf.static)) {
    list = conf.static;
  }
  list.forEach((item) => {
    const staticPath = app.$resolve(item);
    app.use($koaStatic(staticPath));
  });
};
module.exports = configStatic;
