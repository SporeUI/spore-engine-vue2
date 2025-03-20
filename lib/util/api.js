import $get from 'lodash/get';
import $noop from 'lodash/noop';
import $isPlainObject from 'lodash/isPlainObject';
import $cloneDeep from 'lodash/cloneDeep';

const fname = '[api]';
const pnameCache = '__api_cache';

const extraApiConfig = {
  cache: 0,
  before: null,
  after: null,
};

const extraConfigKeys = Object.keys(extraApiConfig);

// store 子模块模板
const ApiModule = {
  namespaced: true,
  state() {
    return {
      data: null,
    };
  },
  mutations: {
    set(state, data) {
      const sets = state;
      sets.data = data;
    },
  },
};

// 拉取远程数据的方法
async function apiFetch(para) {
  let requestPromise = null;
  const {
    conf,
    apiName,
    curStore,
  } = this;

  // 缓存时间范围内，多次请求合并为 1 次请求
  if (typeof conf.cache === 'number') {
    const now = new Date().getTime();
    const prev = this.requestTime;
    if (prev && now - prev <= conf.cache) {
      requestPromise = this.requestPromise || null;
    }
  }

  // 经过混合的选项
  let spec = {
    ...conf,
    ...para,
  };

  if (!requestPromise) {
    // 获取单纯的请求参数
    // 请求之前，参数可以被 before 选项处理
    if (typeof spec.before === 'function') {
      spec = spec.before(spec);
    }

    // 实际请求时携带所有参数
    const opts = {
      ...spec,
    };
    extraConfigKeys.forEach((key) => {
      delete opts[key];
    });

    requestPromise = this.$request(opts);
    this.requestTime = new Date().getTime();
    this.requestPromise = requestPromise;
  }

  // 发起实际请求获取请求结果
  let rs = await requestPromise;

  // 请求完毕后，结果可以被 after 选项处理
  if (typeof spec.after === 'function') {
    rs = spec.after(rs);
  }

  // 如果有同名 store 模块，则使用同名 store 模块
  if (!curStore.hasModule(apiName)) {
    // 如果没有同名 store 模块
    // 则对每个接口依据命名注册一个 store 模块
    const smod = Object.create(ApiModule);
    curStore.registerModule(apiName, smod);
  }

  // 将数据存到 store
  curStore.commit(`${apiName}/set`, rs);

  return rs;
}

// 获取具体数据
function apiGet(xpath = '') {
  const {
    apiName,
    curStore,
  } = this;
  const data = $get(curStore, `state[${apiName}].data`);
  let rs = void 0;
  if (!xpath) {
    rs = data;
  } else {
    rs = $get(data, xpath);
  }
  if ($isPlainObject(rs)) {
    rs = $cloneDeep(rs);
  }
  return rs;
}

const api = function (options) {
  const conf = {
    name: '',
    ...extraApiConfig,
    ...options,
  };

  const {
    $logger,
  } = this;

  const apiName = conf.name;

  // 必须为接口定义名称，以用于之后的替换
  if (!apiName) {
    $logger.error(fname, 'Require parameter: options.name');
    return {
      get: $noop,
      fetch: $noop,
    };
  }

  const curStore = this.$store;

  // 从 store 实例获取接口缓存对象
  let apiCache = curStore[pnameCache];
  if (!apiCache) {
    apiCache = {};
    curStore[pnameCache] = apiCache;
  }

  // 如果存在自身接口缓存对象，则直接返回缓存
  let instance = apiCache[apiName];
  if (!instance) {
    // 否则提供详细的数据处理方式
    instance = {
      conf,
      curStore,
      apiName,
    };
    instance.$request = this.$request.bind(this);
    instance.fetch = apiFetch;
    instance.get = apiGet;

    apiCache[apiName] = instance;
  }

  return instance;
};

export default api;

