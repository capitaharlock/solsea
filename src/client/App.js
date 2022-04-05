import React, { useEffect, useMemo } from "react";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import { renderRoutes } from "react-router-config";
import Routes from "./Routes";
import { useDispatch, useSelector } from "react-redux";
import { listenNftChanges } from "./actions/nft";
import AutoLogin from "./pages/Login/AutoLogin";
import { listenCollectionChanges } from "./actions/collections";
import { listenSystemChanges } from "./actions/app";
import Console from "all-art-core/lib/utils/console";
import { CONSOLE_LOG } from "../api/Definitions";
import { handleConnectWallet } from "./actions/user";
import { WalletProviders } from "all-art-core/lib/core/enums";

const App = () => {
  const dispatch = useDispatch();
  useMemo(() => {
    dispatch(listenSystemChanges());
    dispatch(listenNftChanges());
    dispatch(listenCollectionChanges());
  }, []);

  useEffect(() => {
    Console.logToConsole = CONSOLE_LOG;
    setTimeout(() => {
      if ("solana" in window && window["solana"].isPhantom) {
        const isConnected = localStorage.getItem("isPhantomConnected");
        console.log("isConnected", isConnected);
        if (isConnected === "true")
          dispatch(handleConnectWallet(WalletProviders.Phantom));
      }
    }, 300);
  }, []);

  const isDarkMode = useSelector(({ app }) => app.isDarkMode);

  return (
    <ScrollToTop
      excludePath={[
        {
          path: "/explore",
          action: "POP"
        }
      ]}
    >
      <div className={isDarkMode ? "dark-theme" : "light-theme"}>
        <AutoLogin />
        {renderRoutes(Routes)}
      </div>
    </ScrollToTop>
  );
};

export default App;
