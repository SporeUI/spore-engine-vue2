// 忽略部分路由
const pathIgnoreList = [
  '/api',
  '/__webpack_hmr',
  '/assets',
];

async function match(context) {
  const ctx = context;
  let shouldIgnore = false;

  shouldIgnore = !!shouldIgnore;
  pathIgnoreList.some((url) => {
    const match = ctx.path.indexOf(url) === 0;
    if (match) {
      shouldIgnore = true;
    }
    return match;
  });

  return !shouldIgnore;
}

module.exports = match;
