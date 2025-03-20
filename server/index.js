const $Koa = require('koa');
const $path = require('path');
const $lodash = require('lodash');

require('./util/dotenv');

// 挂到 context 上的方法，包装为中间件
const $mwLogger = require('./middleware/logger');
const $error = require('./middleware/error');
const $curl = require('./middleware/curl');
const $devRender = require('./middleware/devRender');
const $prodRender = require('./middleware/prodRender');

// service 是挂到 app 上的服务方法与对象
const $bus = require('./service/bus');
const $static = require('./service/static');
const $logger = require('./service/logger');
const $match = require('./service/match');
const $render = require('./service/render');

const $resolve = require('./util/resolve');

const $init = require('./init');
const $start = require('./start');

// 创建服务对象
function service(options) {
  const app = new $Koa();
  const conf = {
    // 服务运行根路径
    root: process.cwd(),
    // 服务端口
    port: 3000,
    // 开发模式客户端入口文件
    entryClient: './src/entry-client.js',
    // 正式部署客户端入口文件
    distClient: './dist/client/vue-ssr-client-manifest.json',
    // 开发模式服务端入口文件
    entryServer: './src/entry-server.js',
    // 正式部署服务端入口文件
    distServer: './dist/server/vue-ssr-server-bundle.json',
    // 基础模板地址
    templatePath: './server/template.html',
    // 静态文件部署路径，传递给 createBundleRenderer
    basedir: './dist',
    // 站点默认 favicon
    favicon: $resolve('./server/public/favicon-32x32.png'),
    // 静态文件路径
    static: './dist/client',
    ...options,
  };

  // 挂载配置，用于之后使用
  app.config = conf;

  // 基于服务根路径的路径提取方法
  app.$resolve = dir => $path.join(conf.root, dir);

  // 挂载服务
  Object.assign(app, {
    // 挂载日志服务
    $logger,
    // 挂载统一广播实例
    $bus,
    // 配置静态路径
    $static,
    // ssr 渲染匹配规则
    $match,
    // ssr 渲染核心
    $render,
  });

  // 挂载中间件
  app.$middlewares = {
    logger: $mwLogger,
    error: $error,
    curl: $curl,
    devRender: $devRender,
    prodRender: $prodRender,
  };

  // 实现服务的插件化能力
  if (service.plugins) {
    Object.keys(service.plugins).forEach((name) => {
      const factory = service.plugins[name];
      if (typeof factory === 'function') {
        factory(app);
      }
    });
  }

  app.init = function () {
    $bus.emit('init');
    const rs = $init(this);
    $bus.emit('inited');
    return rs;
  };

  app.start = function () {
    $bus.emit('start');
    const rs = $start(this);
    $bus.emit('started');
    return rs;
  };

  return app;
}

service.plugins = {};
service.plugin = function (name, factory) {
  $lodash.set(service, `plugins.${name}`, factory);
};

module.exports = service;
