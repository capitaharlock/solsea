const { join } = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const common = require('../common');
const nodeExternals = require('../../scripts/node-externals');
// const nodeExternals = require('webpack-node-externals');

module.exports = merge(common, {
    name: 'server',
    target: 'node',
    entry: [
      join(__dirname, '../../src/server/server')
    ],
    // externals: [nodeExternals()],
    externals: nodeExternals,
    output: {
        filename: 'app.server.js',
        libraryTarget: 'commonjs2',
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
    ],
});
