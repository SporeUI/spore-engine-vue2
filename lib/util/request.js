import $isPlainObject from 'lodash/isPlainObject';

const fname = '[request]';

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

function getWrapMsg(conf, startTime) {
  return (action, msg) => {
    const dur = `${new Date() - startTime}ms`;
    return [
      `${fname} ${action}`,
      `name: ${conf.name}`,
      msg,
      `duration: ${dur}`,
    ].join('\n');
  };
}

function getResolveError(conf) {
  let { resolveError } = conf;
  if (typeof resolveError !== 'function') {
    // 统一错误信息处理
    resolveError = function (err) {
      if (err) {
        if (err.message) {
          const errMsg = [
            conf.wrapMsg('error:', `message: ${err.message}`),
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
  return resolveError;
}

function getLog(conf) {
  const ctx = this;
  return (level, ...args) => {
    if (!conf.showLog) return;
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
      conf.wrapMsg('end:', `status: ${response.status}`),
      `result: ${limitMsg(strRs, 300)}`,
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

async function request(options) {
  const extra = {
    // 请求名称
    name: '',
    // 请求地址
    url: '',
    // 缓存时间
    cache: 0,
    // 显示日志
    showLog: true,
    // 返回内容的格式
    responseType: 'json',
    // 替换默认的错误消息处理方式
    resolveError: null,
  };

  const conf = {
    ...extra,
    ...options,
  };

  const {
    $plug,
  } = this;

  if (typeof conf.log !== 'function') {
    conf.log = getLog.call(this, conf);
  }

  if (typeof conf.wrapMsg !== 'function') {
    conf.wrapMsg = getWrapMsg(conf, new Date());
  }

  if (typeof conf.resolveError !== 'function') {
    // 统一错误信息处理
    conf.resolveError = getResolveError(conf);
  }

  // 清理选项
  const spec = Object.assign({}, conf);
  Object.keys(extra).forEach((key) => {
    delete spec[key];
  });

  const strSpec = JSON.stringify(spec);
  const startMsg = [
    `${fname} start:`,
    `name: ${conf.name}`,
    `url: ${conf.url}`,
    `config: ${limitMsg(strSpec, 300)}`,
  ].join('\n');
  conf.log('tip', startMsg);

  try {
    const response = await $plug.fetch(conf.url, spec);
    return await resolveRs(response, conf);
  } catch (err) {
    conf.resolveError(err);
    return null;
  }
};

export default request;
