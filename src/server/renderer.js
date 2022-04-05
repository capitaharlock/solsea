import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { renderRoutes } from "react-router-config";
import serialize from "serialize-javascript";
import { Helmet } from "react-helmet";
import StyleContext from "isomorphic-style-loader/StyleContext";
import Routes from "../client/Routes";
import { CookiesProvider } from "react-cookie";
import { isStaging } from "../api/Definitions";
import ReactNotification from "react-notifications-component";
import { I18nextProvider, useSSR } from "react-i18next";
import i18n from "./i18n";
import { resolveHost } from "./resolveHost";

const nofollowPages = [
  { path: "/wallet/", exact: false },
  { path: "/embedded-exhibition/", exact: false },
  { path: "/artist/f/", exact: true },
  { path: "/artworks/f/", exact: true }
];

export default (req, store, data = {}) => {
  const css = new Set();
  const insertCss = (...styles) => {
    // eslint-disable-next-line no-underscore-dangle

    styles.forEach(style => css.add(style._getCss()));
  };
  const locale = resolveHost(req.host);
  i18n.changeLanguage(locale);

  const context = {};

  const {
    app: { isDarkMode }
  } = store.getState();

  const content = renderToString(
    <CookiesProvider cookies={req.universalCookies}>
      <StyleContext.Provider value={{ insertCss }}>
        <Helmet titleTemplate="%s" defaultTitle="Solsea">
          <meta
            name="description"
            content="The first NFT marketplace that enables creators to choose and embed licenses in NFTs. Creators know what they are selling, collectors know what they are buying."
          />
          <link rel="canonical" href={process.env.ROOT_URL + req.path} />
        </Helmet>
        <Provider store={store}>
          <StaticRouter location={req.url} context={context}>
            <ReactNotification />
            <I18nextProvider i18n={i18n}>
              <div className={isDarkMode ? "dark-theme" : "light-theme"}>
                {renderRoutes(Routes)}
              </div>
            </I18nextProvider>
          </StaticRouter>
        </Provider>
      </StyleContext.Provider>
    </CookiesProvider>
  );

  let isNofollow = false;

  nofollowPages.forEach(({ path, exact }) => {
    if (exact) {
      if (req.path === path) isNofollow = true;
    } else {
      if (req.path.includes(path)) isNofollow = true;
    }
  });

  if (req.query && req.path === "/thank-you-newsletter/") {
    const params = new URLSearchParams(req.query);
    if (params.get("token")) {
      isNofollow = true;
    }
  }

  const resources = i18n.getResourceBundle(locale);
  const i18nClient = { locale, resources };
  const helmet = Helmet.renderStatic();

  return `<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
  <head>
    <link href="/fonts/fonts.css" as="style" rel="preload"/>
		${helmet.title.toString()}
		<link rel="icon" type="image/svg+xml" href="/logo_solo.svg">
		<link rel="mask-icon" href="/logo_solo.svg" />
		${helmet.link.toString()}

		<meta name="viewport" content="width=device-width, initial-scale=1.0", maximum-scale=1/>
		<meta name="fragment" content="!" />
		<meta name="author" content="Solsea" />
		<meta name="msapplication-TileColor" content="#e37d3d" />
		<meta name="msapplication-TileImage" content="/logo_solo.svg" />
		<meta name="theme-color" content="#ffffff" />
		<meta name="apple-mobile-web-app-status-bar" content="#ffffff" />	  

  	<link rel="canonnical" href="https://solsea.io/">
    <script src="/bootstrap/js/bootstrap.bundle.min.js" ></script>
    <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="/font-awesome/fonts/fonts.css" type="text/css">
    <link rel="stylesheet" href="/font-awesome/fonts/brands.css" >
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
		${helmet.meta.toString()}
    ${data.js}
    ${
      isNofollow
        ? `<meta name="robots" content="noindex,nofollow" />`
        : !isStaging
        ? `<meta name="robots" content="index,follow" />`
        : `<meta name="robots" content="noindex,follow"/>`
    }
    <style id="css" type="text/css">${[...css].join("")}</style>
    <link href="/fonts/fonts.css" type="text/css" defer="defer" rel="stylesheet"/>
		<noscript>
			This website needs js to run.
		</noscript>
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0ZZLLYPZLJ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-0ZZLLYPZLJ');
    </script>
	</head>
	<body>
			<div id="app">${content}</div>
			<script>window.__PRELOADED_STATE__ = ${serialize(store.getState()).replace(
        /</g,
        "\\u003c"
      )}</script>
      <script>window.__LOCALE__ = ${serialize(i18nClient)}</script>
	</body>
</html>`;
};
