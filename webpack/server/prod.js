const merge = require('webpack-merge');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const common = require('./common');

module.exports = merge(common, {
    mode: 'production',
    // devtool: 'source-map',
    plugins: [
      new OptimizeCssAssetsPlugin({
        cssProcessorOptions: {
          safe: true,
          discardComments: {
            removeAll: true,
          }
        }
      })
    ]
});
