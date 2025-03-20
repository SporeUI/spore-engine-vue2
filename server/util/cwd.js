const $path = require('path');

const cwd = dir => $path.join(process.cwd(), dir);

module.exports = cwd;
