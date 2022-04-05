const { join } = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const merge = require("webpack-merge");

const common = require("./common");
const extendedNodeExternals = require("../scripts/extended-node-externals");

module.exports = merge(common, {
  mode: "production",
  target: "node",
  externals: extendedNodeExternals,
  node: {
    __dirname: false,
    __filename: false
  },
  entry: [join(__dirname, "../src/index")],
  output: {
    filename: "index.js",
    path: join(__dirname, "../dist")
  },
  plugins: [
    new CopyPlugin([
      {
        from: join(__dirname, "../public"),
        to: join(__dirname, "../dist/public")
      }
    ])
  ]
});
