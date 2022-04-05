import express from "express";
import { join } from "path";
import cookieMiddleware from "universal-cookie-express";
import middleware from "i18next-http-middleware";
import i18n from "./server/i18n";

const configureDevelopment = app => {
  const clientConfig = require("../webpack/client/dev");
  const serverConfig = require("../webpack/server/dev");
  const multiCompiler = require("webpack")([clientConfig, serverConfig]);
  const { publicPath, path } = clientConfig.output;
  const clientCompiler = multiCompiler.compilers[0];

  app.use(
    require("webpack-dev-middleware")(multiCompiler, {
      publicPath,
      serverSideRender: true
    })
  );

  app.use(require("webpack-hot-middleware")(clientCompiler));

  app.use(publicPath, express.static(path));

  app.use(cookieMiddleware()).use(
    require("webpack-hot-server-middleware")(multiCompiler, {
      serverRendererOptions: { outputPath: path }
    })
  );
};

const configureProduction = app => {
  const publicPath = "/";
  const clientStats = require("./assets/stats.json");
  const serverRender = require("./assets/app.server.js").default;
  const outputPath = join(__dirname, "assets");
  const compression = require("compression");

  function shouldCompress(req, res) {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  }

  app.use(
    compression({
      level: 2, // set compression level from 1 to 9 (6 by default)
      filter: shouldCompress // set predicate to determine whether to compress
    })
  );

  app.use(publicPath, express.static(outputPath));
  app.use(cookieMiddleware()).use(
    serverRender({
      clientStats,
      outputPath
    })
  );
};

const app = express();

const isDevelopment = process.env.NODE_ENV === "development";

app.use("/", express.static("public", { maxAge: "30d" }));

app.use(middleware.handle(i18n));

if (isDevelopment) configureDevelopment(app);
else configureProduction(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}\n`);
});
