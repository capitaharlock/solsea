const { join } = require("path");
const WebpackBar = require("webpackbar");
const envKeys = require("./envKeys");

module.exports = {
  output: {
    path: join(__dirname, "../dist/assets"),
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      {
        test: /\.(css|scss)$/,
        use: [
          "isomorphic-style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              localsConvention: "dashes",
              modules: {
                localIdentName: "[local]__[name]_[hash:base64:5]"
              }
            }
          },
          {
            loader: "postcss-loader",
            options: {
              config: {
                path: join(__dirname, "./postcss.config.js")
              }
            }
          },
          "sass-loader"
        ]
      },
      {
        test: /\.(png|jpg|svg)$/,
        use: ["file-loader"]
      }
    ]
  },
  plugins: [envKeys()]
};
