export function getWalletRoutes({ urlPrefix = "" }) {
  return routes.map(r => ({ ...r, route: urlPrefix + r.route }));
}

const routes = [
  {
    title: "wallet.listed",
    route: "/listed-nfts"
  },
  {
    title: "wallet.unlisted",
    route: "/unlisted-nfts"
  },
  {
    title: "wallet.history",
    route: "/transaction-history"
  }
];
