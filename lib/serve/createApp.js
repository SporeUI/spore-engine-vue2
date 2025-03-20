const createApp = function (options) {
  const {
    Vue,
    $mixin,
  } = this;

  const conf = {
    render: null,
    router: null,
    store: null,
    ...options,
  };

  const {
    render,
    router,
    store,
  } = conf;

  // 传递给 Vue 的选项
  const vueOptions = {
    router,
    store,
    render,
  };

  Vue.mixin($mixin);

  Object.keys(this.$components).forEach((name) => {
    const comp = this.$components[name];
    Vue.component(name, comp);
  });

  const app = new Vue(vueOptions);

  // 暴露 app 到全局变量，以便调试工具使用
  if (typeof window !== 'undefined') {
    if (!window['engine-app']) {
      window['engine-app'] = app;
    }
  }

  return {
    router,
    store,
    app,
  };
};

export default createApp;
