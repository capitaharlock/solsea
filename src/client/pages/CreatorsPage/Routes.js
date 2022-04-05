export function getCreatorRoutes({ urlPrefix = "" }) {
  return routes.map(r => ({ ...r, route: urlPrefix + r.route }));
}

const routes = [
  {
    title: "creator.nfts",
    route: "/nfts"
  },
  {
    title: "creator.collections",
    route: "/collections"
  },
  {
    title: "creator.biography",
    route: "/biography"
  }
];
