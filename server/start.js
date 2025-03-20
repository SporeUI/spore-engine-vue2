const $ip = require('ip');

async function start(app) {
  const conf = app.config;
  const {
    $logger,
  } = app;
  const { port } = conf;
  $logger.info(`- root: ${conf.root}`);
  $logger.info(`- NODE_ENV: ${process.env.NODE_ENV}`);
  $logger.info('app.config:', conf);

  const publicIp = $ip.address('public');
  const localHost = `http://localhost:${port}/`;
  const networkHost = `http://${publicIp}:${port}/`;
  $logger.success('App started');
  $logger.stress(`- Local:   ${localHost}`);
  $logger.stress(`- Network: ${networkHost}`);

  // 提供这个选项，是为了可供 tsw 之类程序扩展
  let server = null;
  if (!conf.notListen) {
    server = await app.listen(port);
  }

  return server;
}

module.exports = start;
