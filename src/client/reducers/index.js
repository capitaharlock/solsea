import { combineReducers } from "redux";
import app from "./app";
import nfts from "./nfts";
import traits from "./traits";
import user from "./user";
import collections from "./collections";
import listedLicenses from "./licenses";
import tags from "./tags";
import explore from "./explore";
import mints from "./mints";
import creators from "./creators";
import collectionStatistics from "./collection-statistics";
import saleshistory from "./saleshistory";
import history from "./history";

export default combineReducers({
  app,
  nfts,
  traits,
  user,
  collections,
  listedLicenses,
  tags,
  explore,
  mints,
  creators,
  collectionStatistics,
  saleshistory,
  history
});
