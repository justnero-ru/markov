module.exports = {
  lintOnSave: undefined,
  publicPath: process.env.VUE_PUBLIC_PATH || 'markov',
  outputDir: process.env.VUE_OUTPUT_DIR || 'docs',
  assetsDir: 'assets',
  runtimeCompiler: undefined,
  productionSourceMap: false,
  parallel: undefined,

  css: {
    sourceMap: true
  }
};
