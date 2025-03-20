const $fetch = require('node-fetch');
const $HttpsProxyAgent = require('https-proxy-agent');

let agent = null;

function fetch(url, options) {
  const httpsProxy = process.env.http_proxy || process.env.HTTP_PROXY;
  if (!agent && httpsProxy) {
    agent = new $HttpsProxyAgent(httpsProxy);
  }

  const conf = {
    agent,
    ...options,
  };
  return $fetch(url, conf);
}

module.exports = fetch;
