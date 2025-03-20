function renderVConsole(context) {
  let strOutput = '';
  const { query } = context;
  if (query && query.vconsole === 'on') {
    strOutput = `
<script src="https://s.yangshipin.cn/CCTVVideo/CCTVVideoAssets/v1/js/vconsole.min.js"></script>
<script>
if (!window.vConsole) {
  window.vConsole = new VConsole();
}
</script>`;
  }
  return strOutput;
}

module.exports = renderVConsole;
