const routerReady = router => new Promise((resolve) => {
  router.onReady(resolve);
});

const createServer = function () {
  return async (renderContext) => {
    const {
      $bus,
    } = this;

    const rctx = renderContext;
    // 当我们将状态附加到上下文
    // 并且 `template` 选项用于 renderer 时
    // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML
    const {
      url,
      $fetch,
    } = rctx;

    const {
      app,
      router,
      store,
    } = this.createApp();

    if ($fetch && this.$plug) {
      this.$plug.fetch = $fetch;
    }

    const renderStart = Date.now();
    const { fullPath } = router.resolve(url).route;

    if (fullPath !== url) {
      const err = new Error('fullPath not match ctx.url');
      err.url = fullPath;
      throw err;
    }

    // set router's location
    router.push(url);

    await routerReady(router);

    const matchedComponents = router.getMatchedComponents();
    // no matched routes
    if (!matchedComponents.length) {
      const err = new Error('Page not found');
      err.code = 404;
      throw err;
    }

    // Vue服务端渲染流程，同步信息上报
    const onLog = (message) => {
      const msg = message;
      let method = msg.flag || msg.level;
      if (!rctx.$logger[method]) {
        method = 'log';
      }
      rctx.$logger[method](...msg.content);
    };
    $bus.on('$engine:log', onLog);

    rctx.rendered = () => {
      rctx.$logger.debug(`data pre-fetch duration: ${Date.now() - renderStart}ms`);
      rctx.state = store.state;
      $bus.off('$engine:log', onLog);
    };

    return app;
  };
};

export default createServer;
