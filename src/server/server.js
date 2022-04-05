import renderer from "./renderer";
import createStore from "../store/createStore";
import flushChunks from "webpack-flush-chunks";
import { matchRoutes } from "react-router-config";
import { matchPath, Router } from "react-router";
import Routes, { SubRoutes } from "../client/Routes";
import https from "https";
import { switchDarkMode } from "../client/actions/app";

https.globalAgent.options.rejectUnauthorized = false;

export default ({ clientStats }) => (req, res) => {
  const store = createStore();
  const darkMode =
    req.universalCookies &&
    req.universalCookies.cookies &&
    req.universalCookies.cookies.darkMode === "true"
      ? true
      : false;

  store.dispatch(switchDarkMode(darkMode));

  const { js } = flushChunks(clientStats, { chunkNames: [] });
  let contains404 = false;
  let redirection = "";

  const token =
    req.universalCookies &&
    req.universalCookies.cookies &&
    req.universalCookies.cookies.auth_token;
  const routes = matchRoutes(Routes, req.path);

  const promises = routes
    .map(({ route, match }) => {
      const potentialRedireciton = redirectionPaths.find(
        red => red.from === match.path
      );
      if (potentialRedireciton) {
        redirection = {
          ...potentialRedireciton,
          param: potentialRedireciton.redirectionParam
            ? match.params[potentialRedireciton.redirectionParam]
            : ""
        };
      }
      if (route.status === 404) {
        contains404 = true;
      }
      return route.loadData
        ? route.loadData(store, match.params, req.query, req.path, req)
        : null;
    })
    .map(promise => {
      if (promise)
        return new Promise((resolve, reject) => {
          promise.then(resolve).catch(err => {
            contains404 = true;
            reject(err);
          });
        });
      return null;
    });

  Promise.all(promises)
    .then(() => {
      try {
        const markup = renderer(req, store, { js });
        if (contains404) {
          res.status(404);
        }
        res.send(markup);
      } catch (error) {
        console.log("renderer error");
        res.send("");
      }
    })
    .catch(err => {
      try {
        if (redirection) {
          if (
            err.response &&
            err.response.data &&
            err.response.data.error === 403
          ) {
            res.redirect(
              `${redirection.to}${
                redirection.param ? `${redirection.param}/` : ""
              }`
            );
            return;
          }
        }

        console.log("is 404", err);
        const markup = renderer({ path: "/404" }, store, { js });
        res.status(404);
        res.send(markup);
      } catch (error) {
        console.log("catch error", error);
        res.send("");
      }
    });
};

const redirectionPaths = [
  // {
  //   from: "/vr-exhibitions/:slug(ea|em|eg|ec)/:url/",
  //   to: "/vr-exhibitions/",
  //   redirectionParam: "slug",
  //   param: ""
  // },
  // {
  //   from: "/artist/:url/",
  //   to: "/artist/"
  // },
  // {
  //   from: "/artworks/:url/",
  //   to: "/artworks/"
  // }
  // TODO: Kad se zavrse stranice, aktivirati i ove rute ispod.
  // {
  //   from: "/art/:url/",
  //   to: "/art/"
  // },
  // {
  //   from: "/artifact/:url/",
  //   to: "/artifact/"
  // }
];
