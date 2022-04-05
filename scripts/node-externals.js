const readdirSync = require('fs').readdirSync;
const join = require('path').join;

module.exports = readdirSync(join(__dirname, '../node_modules'))
    .filter(x => /compression|express|bar|worker-farm|terser-webpack-plugin|chokidar|loader-runner/.test(x))
    .reduce((externals, mod) => {
        externals[mod] = `commonjs ${mod}`;
        return externals;
    }, {});
