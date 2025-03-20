const $isPlainObject = require('lodash/isPlainObject');
const $fetch = require('./fetch');

const fname = '[curl]';

function getWrapMsg(startTime) {
  return (msg) => {
    const dur = `[duration: ${new Date() - startTime}ms]`;
    return `${fname} ${msg} ${dur}`;
  };
}

function getLog() {
  const ctx = this;
  return (level, ...args) => {
    if (
      ctx
      && ctx.$logger
      && typeof ctx.$logger[level] === 'function'
    ) {
      ctx.$logger[level](...args);
    } else if (console[level]) {
      console[level](...args);
    } else {
      console.log(...args);
    }
  };
}

// 限制文案在一定访问内呈现
function limitMsg(message, count) {
  const maxCount = Math.max(count, 100);
  const msg = `${message}`;
  let rs = msg;
  if (msg.length > maxCount) {
    const halfCount = (maxCount - 8) / 2;
    const preStr = msg.slice(0, halfCount);
    const endStr = msg.slice(msg.length - halfCount);
    rs = `${preStr} ....... ${endStr}`;
  }
  return rs;
}

function getResolveError(conf) {
  return (err) => {
    if (err) {
      if (err.message) {
        const errMsg = [
          conf.wrapMsg(`error: ${err.message}`),
          `${err.stack}`,
        ].join('\n');
        conf.log('error', errMsg);
      } else {
        conf.log('error', err);
      }
    } else {
      conf.log('error', 'unknown error');
    }
  };
}

async function resolveRs(response, conf) {
  let result = null;
  if (response && response.status) {
    let rs = null;

    if (conf.responseType === 'text') {
      rs = await response.text();
    } else if (conf.responseType === 'json') {
      rs = await response.json();
    } else {
      rs = response;
    }

    let strRs = '';
    if (typeof rs === 'string') {
      strRs = rs;
    } else if ($isPlainObject(rs)) {
      strRs = JSON.stringify(rs);
    } else {
      strRs = String(rs);
    }

    const endMsg = [
      conf.wrapMsg(`end: ${response.status}`),
      limitMsg(strRs, 300),
    ].join('\n');
    conf.log('success', endMsg);

    if (rs) {
      result = rs;
    } else {
      throw new Error(`Response is empty. [${response.status}]`);
    }
  } else {
    throw new Error('response is undefined');
  }
  return result;
}

async function curl(options) {
  const extra = {
    url: '',
    responseType: 'text',
    // 替换默认的错误消息处理方式
    resolveError: null,
    // 日志信息包装
    wrapMsg: null,
    // 日志方法
    log: null,
  };

  const conf = {
    ...extra,
    ...options,
  };

  if (typeof conf.log !== 'function') {
    conf.log = getLog.call(this);
  }

  if (typeof conf.wrapMsg !== 'function') {
    conf.wrapMsg = getWrapMsg(new Date());
  }

  if (typeof conf.resolveError !== 'function') {
    // 统一错误信息处理
    conf.resolveError = getResolveError(conf);
  }

  if (conf.url && conf.url.indexOf('//') === 0) {
    conf.url = `http:${conf.url}`;
  }

  // 清理选项
  const spec = Object.assign({}, conf);
  Object.keys(extra).forEach((key) => {
    delete spec[key];
  });

  const startMsg = [
    `${fname} start:`,
    JSON.stringify(spec),
  ].join('\n');
  conf.log('tip', startMsg);

  try {
    const response = await $fetch(conf.url, spec);
    return await resolveRs(response, conf);
  } catch (err) {
    conf.resolveError(err);
    return null;
  }
}

module.exports = curl;
