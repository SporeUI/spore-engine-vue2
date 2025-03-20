const $build = require('./kit/build');
const $print = require('./kit/print');
const $resolve = require('./server/util/resolve');

// spore factory
function factory(spore) {
  const port = Number(process.env.PORT) || 8090;

  spore.register('serve', async () => {
    spore.nodemon({
      script: $resolve('./kit/serve.js'),
      ext: 'js json',
    });
  }, {
    port,
    description: 'development serve',
  });

  spore.register('build', async () => {
    await $build();
  }, {
    port,
    description: 'build app',
  });

  spore.register('print', async () => {
    await $print();
  }, {
    port,
    description: 'print app page',
  });
}

module.exports = factory;
