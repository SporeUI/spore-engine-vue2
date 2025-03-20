const $path = require('path');

const root = $path.resolve(__dirname, '../../');
const resolve = dir => $path.join(root, dir);

module.exports = resolve;
