const $path = require('path');
const $webpack = require('webpack');
const $logger = require('../server/service/logger');
const { VueLoaderPlugin } = require('vue-loader');

// 调试开关，监控 webpack 构建进度
const outputProgress = false;
const levels = [];
function progressHandler(percentage, message, ...args) {
  if (!outputProgress) return;
  const percent = percentage * 100;
  const grade = Math.floor(percent);
  if (!levels[grade]) {
    levels[grade] = true;
    if (grade === 0) {
      $logger.info('compile progress start');
    }
    $logger.info(`${percent}%`, message, ...args);
    if (grade === 100) {
      $logger.success('compile progress done');
    }
  }
}

const baseConfig = {
  devtool: '#cheap-module-source-map',
  mode: 'development',
  output: {
    path: $path.join(process.cwd(), 'dist'),
    publicPath: '/assets/',
    filename: '[name].[chunkhash].js',
  },
  module: {
    // avoid webpack shimming process
    noParse: /es6-promise\.js$/,
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false,
          },
        },
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
    ],
  },
  performance: {
    hints: false,
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
};

if (outputProgress) {
  baseConfig.plugins.push(new $webpack.ProgressPlugin(progressHandler));
}

module.exports = baseConfig;
