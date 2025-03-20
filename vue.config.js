const $path = require('path');
const $fse = require('fs-extra');
const $lodash = require('lodash');
const $VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const $VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const $postcssPresetEnv = require('postcss-preset-env');
const $postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const $postcssNormalize = require('postcss-normalize');

const dirCwd = process.env.BUILD_CWD || process.cwd();
const resolve = dir => $path.join(__dirname, dir);
const cwd = dir => $path.join(dirCwd, dir);
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
const targetIsServer = process.env.WEBPACK_TARGET === 'node';

console.log('[vue.config] process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('[vue.config] process.env.BUILD_CWD:', process.env.BUILD_CWD);
console.log('[vue.config] process.env.WEBPACK_TARGET:', process.env.WEBPACK_TARGET);
console.log('[vue.config] isDev:', isDev);
console.log('[vue.config] isProd:', isProd);
console.log('[vue.config] __dirname:', __dirname);
console.log('[vue.config] cwd:', dirCwd);

const cwdVueConfigFile = cwd('./vue.config.js');
let cwdVueConfig = {};
if ($fse.existsSync(cwdVueConfigFile)) {
  cwdVueConfig = require(cwdVueConfigFile);
}
const {
  chainWebpack,
  configureWebpack,
} = cwdVueConfig;
delete cwdVueConfig.chainWebpack;
delete cwdVueConfig.configureWebpack;

const defaultPostCssPlugins = [
  $postcssFlexbugsFixes,
  $postcssPresetEnv({
    autoprefixer: {
      flexbox: 'no-2009',
    },
    stage: 3,
  }),
  $postcssNormalize(),
];

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcss',
    plugins: defaultPostCssPlugins,
    ...$lodash.get(cwdVueConfig, 'css.loaderOptions.postcss'),
  },
};

const cssLoader = (opts) => {
  const options = {
    ...opts,
  };
  return {
    loader: 'css-loader',
    options,
  };
};

function setDevMode(conf, confMode) {
  const wconf = conf;
  $lodash.merge(wconf, {
    resolve: {
      extensions: [
        '.js',
        '.vue',
        '.less',
        '.css',
        '.json',
      ],
      modules: [
        'node_modules',
        cwd('node_modules'),
      ],
    },
  });

  let cssRules = [];
  if (confMode === 'client') {
    cssRules = [
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]?[hash]',
        },
      },
      {
        test: /\.svg$/,
        use: [
          'svg-sprite-loader',
          'svg-transform-loader',
          'svgo-loader',
        ],
      },
      {
        test: /\.css?$/,
        use: [
          'vue-style-loader',
          cssLoader({
            importLoaders: 1,
          }),
          postcssLoader,
        ],
      },
      {
        test: /\.less?$/,
        use: [
          'vue-style-loader',
          cssLoader({
            importLoaders: 2,
          }),
          postcssLoader,
          'less-loader',
        ],
      },
    ];
  } else {
    cssRules = [
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'null-loader',
      },
      {
        test: /\.svg$/,
        loader: 'null-loader',
      },
      {
        test: /\.css?$/,
        loader: 'null-loader',
      },
      {
        test: /\.less?$/,
        loader: 'null-loader',
      },
    ];
  }
  const wrules = $lodash.get(wconf, 'module.rules');
  cssRules.forEach((rule) => {
    wrules.push(rule);
  });
}

function setProdMode(conf, confMode) {
  const wconf = conf;
  const modules = $lodash.get(wconf, 'resolve.modules', []);
  modules.push(cwd('node_modules'));

  const lmodules = $lodash.get(wconf, 'resolveLoader.modules', []);
  lmodules.push(cwd('node_modules'));

  if (confMode === 'server') {
    // server config
    Object.assign(wconf, {
      // 将 entry 指向应用程序的 server entry 文件
      entry: resolve('src/entry-server.js'),

      // 这允许 webpack 以 Node 适用方式(Node-appropriate fashion)处理动态导入(dynamic import)，
      // 并且还会在编译 Vue 组件时，
      // 告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
      target: 'node',

      // 对 bundle renderer 提供 source map 支持
      devtool: 'source-map',
    });

    // 此处告知 server bundle 使用 Node 风格导出模块(Node-style exports)
    $lodash.set(wconf, 'output.libraryTarget', 'commonjs2');

    // 这是将服务器的整个输出
    // 构建为单个 JSON 文件的插件。
    // 默认文件名为 `vue-ssr-server-bundle.json`
    wconf.plugins.push(new $VueSSRServerPlugin());
  } else {
    // client config
    wconf.module.rules.forEach((rule) => {
      const srule = rule;
      if (rule.test) {
        const strTest = rule.test.toString();
        if (strTest === '/\\.(svg)(\\?.*)?$/') {
          srule.use = [
            'svg-sprite-loader',
            'svg-transform-loader',
            'svgo-loader',
          ];
        }
      }
    });

    const exts = $lodash.get(wconf, 'resolve.extensions', []);
    exts.push('.less');
    exts.push('.css');

    wconf.plugins.push(new $VueSSRClientPlugin());
  }
}

const vueConfig = {
  publicPath: '/',
  // eslint-loader 是否在保存的时候检查
  lintOnSave: false,
  // 去掉文件名中的 hash
  filenameHashing: false,
  // webpack配置
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: (config) => {
    // 删除`prefetch、preload`模块
    config.plugins
      .delete('html')
      .delete('preload')
      .delete('prefetch')
      .end()
      .resolve
      .symlinks(true);

    // 开发环境
    config.when(
      isDev,
      config => config
        .devtool('source-map'),
    );

    config.when(
      targetIsServer,
      config => config
        .optimization
        .delete('splitChunks'),
    );

    // npm package 更新后，发现构建时还在用老的 package，经查明是缓存未更新
    // @see https://cli.vuejs.org/zh/guide/cli-service.html#%E7%BC%93%E5%AD%98%E5%92%8C%E5%B9%B6%E8%A1%8C%E5%A4%84%E7%90%86
    // 因此构建时移除缓存，确保构建正常
    // dev 模式如果遇到缓存异常，需要到 engine 目录的 node_modules 目录下，移除 .cache 目录，移除 dist 目录
    ['vue', 'js', 'ts', 'tsx'].forEach((ext) => {
      const rule = config.module.rule(ext);
      rule.uses.delete('cache-loader');
    });

    if (typeof chainWebpack === 'function') {
      chainWebpack(config);
    }
  },
  // css相关配置
  css: {
    loaderOptions: {
      postcss: {
        plugins: defaultPostCssPlugins,
      },
    },
  },
  parallel: require('os').cpus().length > 1,
};

if (targetIsServer) {
  Object.assign(vueConfig, {
    outputDir: 'dist/server',
  });
} else {
  // 依赖中引入的代码，不经配置，不会被 babel 转译
  // 便捷起见，对所有依赖组件进行编译
  // @see https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel
  // 这个配置对 development 模式无效，未走到这个匹配列表
  vueConfig.transpileDependencies = [
    /node_modules/,
  ];

  Object.assign(vueConfig, {
    // 输出文件目录
    outputDir: 'dist/client',
    pages: {
      index: {
        // page 的入口
        entry: 'src/entry-client.js',
      },
    },
    // PWA 插件相关配置
    // see https://github.com/vuejs/vue-cli/tree/dev/package/%40vue/cli-plugin-pwa
    pwa: {},
  });
}

Object.assign(vueConfig, {
  configureWebpack(conf, mode) {
    let confMode = mode;
    const wconf = conf;
    if (!confMode) {
      // prod mode
      if (targetIsServer) {
        confMode = 'server';
      } else {
        confMode = 'client';
      }
      setProdMode(wconf, confMode);
    } else {
      // dev mode
      setDevMode(wconf, confMode);
    }

    if (typeof configureWebpack === 'function') {
      configureWebpack(wconf, confMode);
    }
  },
});

// 合并 cwd 下的 vue.config.js 的配置
$lodash.merge(vueConfig, cwdVueConfig);

console.log('[vue.config] publicPath:', vueConfig.publicPath);
console.log('[vue.config] vueConfig:', vueConfig);

module.exports = vueConfig;
