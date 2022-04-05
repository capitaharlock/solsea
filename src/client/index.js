import React from "react";
import ReactDOM from "react-dom";
import StyleContext from "isomorphic-style-loader/StyleContext";
import reducers from "./reducers";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import { setInitialRender } from "./actions/app";
import { CookiesProvider } from "react-cookie";
import TagManager from "react-gtm-module";
import { isProduction } from "../api/Definitions";
import AppComponent from "./App";
import { BrowserRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import ReactNotification from "react-notifications-component";
import { I18nextProvider, useSSR } from "react-i18next";
import i18n from "./i18n";
import "./i18n";
import Loader from "./components/Loader/Loader";

const state = window.__PRELOADED_STATE__;
// delete window.__PRELOADED_STATE__;
const translation = window.__LOCALE__;
i18n.changeLanguage(translation.locale);
i18n.addResourceBundle(
  translation.locale,
  "translation",
  translation.resources,
  true
);

export const store = createStore(reducers, state, applyMiddleware(thunk));

const insertCss = (...styles) => {
  const removeCss = styles.map(x => x._insertCss());
  return () => {
    removeCss.forEach(f => f());
  };
};

const tagManagerOptions = {
  gtmId: "GTM-TJ35XG5",
  auth: "BhzEWZAH0xcAQDpudMDlcg",
  preview: "env-1"
};

if (isProduction) {
  TagManager.initialize(tagManagerOptions);
}

const App = ({ location = "/" }) => {
  // const AppComponent = lazy(() => import("./App"));

  return (
    <CookiesProvider>
      <StyleContext.Provider value={{ insertCss }}>
        <Provider store={store}>
          <Helmet titleTemplate="%s" defaultTitle="Solsea">
            <meta
              name="description"
              content="The first NFT marketplace that enables creators to choose and embed licenses in NFTs. Creators know what they are selling, collectors know what they are buying."
            />
            <link rel="canonical" href={process.env.ROOT_URL + location} />
          </Helmet>

          <BrowserRouter>
            <ReactNotification />
            <I18nextProvider i18n={i18n}>
              <AppComponent />
            </I18nextProvider>
          </BrowserRouter>
        </Provider>
      </StyleContext.Provider>
    </CookiesProvider>
  );
};

let isInitialRender = true;

const renderReactApp = isInitialRender ? ReactDOM.hydrate : ReactDOM.render;
renderReactApp(<App />, document.getElementById("app"), () => {
  if (isInitialRender) {
    store.dispatch(setInitialRender(false));
    isInitialRender = !isInitialRender;
    const elem = document.getElementById("css");
    if (elem) elem.parentNode.removeChild(elem);
  }
});

// Needed for Hot Module Replacement
if (typeof module.hot !== "undefined") {
  module.hot.accept(); // eslint-disable-line no-undef
}

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('./vraaServiceWorker.js')
//       .then(reg => {/* console.log('Service Worker: Registered (Pages)')*/ })
//       .catch(err => console.log(`Service Worker: Error: ${err}`));
//   });
// }
