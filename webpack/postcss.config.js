const pkg = require("../package.json");

module.exports = () => ({
  plugins: [
    require("postcss-import")(),
    require("postcss-preset-env")({
      stage: 3,
      browsers: pkg.browserslist,
      autoprefixer: {
        flexbox: "no-2009"
      }
    }),
    require("postcss-clean")()
  ]
});
