const $build = require('./kit/build');
const $print = require('./kit/print');
const $resolve = require('./server/util/resolve');

// poodle factory
function factory(poodle) {
  const port = Number(process.env.PORT) || 8090;

  poodle.register('serve', async () => {
    poodle.nodemon({
      script: $resolve('./kit/serve.js'),
      ext: 'js json',
    });
  }, {
    port,
    description: 'development serve',
  });

  poodle.register('build', async () => {
    await $build();
  }, {
    port,
    description: 'build app',
  });

  poodle.register('print', async () => {
    await $print();
  }, {
    port,
    description: 'print app page',
  });
}

module.exports = factory;
