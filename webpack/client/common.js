const merge = require("webpack-merge");
const common = require("../common");

module.exports = merge(common, {
  name: "client",
  target: "web",
  output: {
    filename: "app.client.js",
    chunkFilename: "[name].chunk.js"
  },
  optimization: {
    runtimeChunk: {
      name: "bootstrap"
    },
    splitChunks: {
      chunks: "initial",
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor"
        }
      }
    }
  }
});
