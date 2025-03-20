const createStore = function (options) {
  const {
    Vue,
    Vuex,
  } = this;

  Vue.use(Vuex);
  const conf = {
    state: {
      pageTitle: '',
      pageInfo: {},
      pageContext: {},
    },
    actions: {},
    mutations: {
      // 页面标题
      pageTitle(spec, title) {
        const state = spec;
        state.pageTitle = title;
      },
      // 页面 meta 元信息
      pageInfo(state, info) {
        Object.assign(state.pageInfo, info);
      },
      // 页面其他需要预渲染的内容
      pageContext(state, info) {
        Object.assign(state.pageContext, info);
      },
    },
    ...options,
  };
  const store = new Vuex.Store(conf);
  return store;
};

export default createStore;
