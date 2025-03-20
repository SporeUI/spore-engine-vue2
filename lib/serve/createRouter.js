const createRouter = function (options) {
  const {
    Vue,
    VueRouter,
  } = this;

  Vue.use(VueRouter);

  const conf = {
    // 活动页面不需要服务端渲染路由
    // 但是期望能监控 query 变更
    mode: 'history',
    fallback: false,
    scrollBehavior: () => ({ y: 0 }),
    routes: [],
    ...options,
  };

  const router = new VueRouter(conf);
  return router;
};

export default createRouter;
