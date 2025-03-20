import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import Engine from '../lib/index';

// $routes,$hook 文件来自于临时生成的文件
import $routes from '../temp/pages_routes.js';
import $hook from '../temp/hook.js';

// 播放器使用自定义标签
Vue.config.ignoredElements = [
  'ys-player',
];

const app = new Engine({
  Vue,
  Vuex,
  VueRouter,
});

app.init({
  appCreated(vapp) {
    const {
      router,
      store,
    } = vapp;
    $routes.forEach((item) => {
      router.addRoute(item);
    });
    const pages = $routes.map(item => item.path);
    store.commit('routes/set', pages);
    if (typeof $hook === 'function') {
      $hook(this, vapp);
    }
  },
});

export default app;
