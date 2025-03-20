const $vsrPkg = require('vue-server-renderer/package.json');
const $koaPkg = require('koa/package.json');
const $getCtxLogger = require('../util/getCtxLogger');
const $fetch = require('../util/fetch');
const $renderVConsole = require('../util/renderVConsole');

const serverInfo = `koa/${$koaPkg.version} vue-server-renderer/${$vsrPkg.version}`;

// 服务端渲染
async function render(context, renderer) {
  const ctx = context;
  const { app } = ctx;
  const { $bus } = app;
  const tstart = Date.now();
  ctx.$logger.info('render start');

  ctx.append('Content-Type', 'text/html');
  ctx.append('Server', serverInfo);

  const renderContext = {};
  [
    'guid',
    'url',
    '$curl',
  ].forEach((name) => {
    renderContext[name] = ctx[name];
  });
  renderContext.$fetch = $fetch;
  renderContext.$logger = $getCtxLogger(ctx, app.$logger, {
    module: 'ssr',
  });
  renderContext.state = {};
  renderContext.renderVConsole = () => $renderVConsole(context);

  const rs = {};
  let error = null;
  try {
    $bus.emit('render', renderContext);
    rs.html = await renderer.renderToString(renderContext);
    rs.html = rs.html.replace(
      (/(<script[^>]+)defer>/gi),
      '$1defer crossorigin="anonymous">',
    );

    const { state } = renderContext;
    if (state.pageTitle) {
      rs.html = rs.html.replace(
        (/<title>[^<>]*<\/title>/gi),
        `<title>${state.pageTitle}</title>`,
      );
    }

    if (state.pageContext) {
      const { pageInject } = state.pageContext;
      if (pageInject) {
        rs.html = rs.html.replace(
          (/<link name="inject">/gi),
          pageInject,
        );
      }
    }

    if (state.pageInfo) {
      Object.keys(state.pageInfo).forEach((key) => {
        const content = state.pageInfo[key];
        if (!content) return;
        const reg = new RegExp(`<meta name="${key}">`, 'gi');
        rs.html = rs.html.replace(reg, content);
      });
    }
  } catch (err) {
    error = err;
  }
  ctx.$logger.info(`render end: ${Date.now() - tstart}ms`);
  if (error) {
    throw error;
  }
  $bus.emit('rendered', rs);
  return rs.html;
}

module.exports = render;
