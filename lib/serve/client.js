const createClient = function () {
  const {
    config,
    $logger,
  } = this;

  $logger.theme({
    colors: {
      info: '#87a1ff',
    },
    icons: {
      info: {
        icon: '*',
        color: '#87a1ff',
      },
    },
  });

  const {
    store,
    app,
  } = this.createApp();

  // 对于客户端
  // 直接将 window.__INITIAL_STATE__ 替换到 store 的 state
  const prop = '__INITIAL_STATE__';
  const state = window[prop] || {};
  state.mode = 'client';
  store.replaceState(state);

  app.$mount(`#${config.id}`);
  return app;
};

export default createClient;
