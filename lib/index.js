import Mitt from 'mitt';
import nossr from 'vue-no-ssr';
import Colorogger from 'colorogger/lib/client';
import 'whatwg-fetch';

import $createRouter from './serve/createRouter';
import $createStore from './serve/createStore';
import $createApp from './serve/createApp';
import $client from './serve/client';
import $server from './serve/server';
import $getMixin from './util/getMixin';
import App from './comps/App';
import Home from './comps/Home';

const components = {
  'no-ssr': nossr,
};

const noop = () => {};
class Engine {
  constructor(options) {
    const conf = {
      Vue: null,
      Vuex: null,
      VueRouter: null,
      ...options,
    };
    this.Vue = conf.Vue;
    this.Vuex = conf.Vuex;
    this.VueRouter = conf.VueRouter;
  }

  // 初始化
  init(options) {
    const conf = {
      // store 选项
      storeOptions: null,
      // router 选项
      routerOptions: null,
      // 根节点 id
      id: 'app',
      // 布局文件存放路径
      layoutPath: '',
      // vue render 方法
      render: h => h(App),
      // 生命周期: vueApp 已创建
      appCreated: noop,
      ...options,
    };

    // 提供一些插件方法，可在 mixin 使用
    this.$plug = {};
    if (typeof window !== 'undefined' && window.fetch) {
      this.$plug.fetch = window.fetch.bind(window);
    }

    // 公共广播
    this.$bus = new Mitt();

    // 日志服务
    this.$logger = new Colorogger({
      print: typeof window !== 'undefined',
      meta: {
        module: 'client',
      },
      transport: (msg) => {
        this.$bus.emit('$engine:log', msg);
      },
    });

    // vue mixin
    this.$mixin = $getMixin.call(this);
    // global components
    this.$components = components;

    this.config = conf;
    this.isInited = true;
  }

  // 创建 router 对象
  createRouter(options) {
    return $createRouter.call(this, options);
  }

  // 创建 store 对象
  createStore(options) {
    return $createStore.call(this, options);
  }

  // 根据vue官方示例，使用工厂方法
  // 避免交叉请求状态污染 (cross-request state pollution)。
  createApp() {
    if (!this.isInited) {
      throw new Error('App is not inited');
    }
    const conf = this.config;
    const store = this.createStore(conf.storeOptions);
    const router = this.createRouter(conf.routerOptions);
    const app = $createApp.call(this, {
      store,
      router,
      render: conf.render,
    });

    router.addRoute({
      path: '/',
      component: Home,
    });

    store.registerModule('routes', {
      namespaced: true,
      state: {
        pages: [],
      },
      mutations: {
        set(state, list) {
          const sets = state;
          if (Array.isArray(list)) {
            sets.pages = list;
          }
        },
      },
    });

    this.app = app;
    if (typeof conf.appCreated === 'function') {
      conf.appCreated.call(this, app);
    }

    return app;
  }

  // 创建 client entry
  client() {
    if (!this.isInited) {
      throw new Error('App is not inited');
    }
    return $client.call(this);
  }

  // 创建 server entry
  server() {
    if (!this.isInited) {
      throw new Error('App is not inited');
    }
    return $server.call(this);
  }
}

export default Engine;
