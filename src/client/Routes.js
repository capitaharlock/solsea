import DefaultLayout from "./layout/DefaultLayout";
import HomePage from "./pages/Home/Home";
import Explore from "./pages/Explore/Explore";
import NftPage from "./pages/Nft/Nft";
import CollectionPage from "./pages/CollectionPage/CollectionPage";
import Collections from "./pages/Collections/Collections";
import Page404 from "./pages/Page404/Page404";
import Create from "./pages/Create/Create";
import Create100 from "./pages/Create100/Create";
import Wallet from "./pages/Wallet/Wallet";
import Login from "./pages/Login/Login";
import EditProfile from "./pages/EditProfile/EditProfile";
import Register from "./pages/Register/Register";
import CreateCollection from "./pages/CreateCollection/CreateCollection";
import CollectionCalendar from "./pages/CollectionCalendar/CollectionCalendar";
import Congratulations from "./pages/Congratulations/Congratulations";
import BuyCongrats from "./pages/Congratulations/BuyCongrats";
import UserCollections from "./pages/UserCollections/UserCollections";
// import Maintenance from "./pages/Maintenance/Maintenance";
import Settings from "./pages/UserSettings/Settings";
import EditCollection from "./pages/EditCollection/EditCollection";
import HostNft from "./pages/HostNft/HostNft";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import CollectionValidation from "./pages/CollectionValidation/CollectionValidation";
import CreatorsPage from "./pages/CreatorsPage/CreatorsPage";
import CollectionStatistics from "./pages/CollectionStatistics/CollectionStatistics";
import StakingPage from "./pages/StakingPage/StakingPage";

export const SubRoutes = [
  {
    ...HomePage,
    path: "/",
    exact: true
  },
  {
    ...CreatorsPage,
    path: "/creator/:_id",
    exact: false
  },
  {
    ...Explore,
    exact: true,
    path: "/explore"
  },
  {
    ...Collections,
    path: "/collections",
    exact: true
  },
  {
    ...CollectionPage,
    path: "/collection/:_id",
    exact: true
  },
  {
    ...CollectionValidation,
    path: "/collection-verification",
    exact: true
  },
  {
    ...CollectionStatistics,
    path: "/collection-statistics",
    exact: true
  },
  {
    ...NftPage,
    exact: true,
    path: "/nft/:pubkey"
  },
  {
    ...Wallet,
    path: "/wallet",
    exact: false
  },
  {
    ...HostNft,
    path: "/hostNft",
    exact: true
  },
  {
    ...Create,
    exact: true,
    path: "/create"
  },
  {
    ...Create100,
    exact: true,
    path: "/stotka"
  },
  {
    ...CreateCollection,
    exact: true,
    path: "/create-collection"
  },
  {
    ...EditCollection,
    exact: true,
    path: "/edit-collection/:_id"
  },
  {
    ...CollectionCalendar,
    exact: true,
    path: "/collection-calendar"
  },
  {
    ...StakingPage,
    exact: true,
    path: "/staking-page"
  },
  {
    ...Login,
    exact: true,
    path: "/login"
  },
  {
    ...ForgotPassword,
    exact: true,
    path: "/forgot-password"
  },
  {
    ...ResetPassword,
    exact: true,
    path: "/reset-password/:token"
  },
  {
    ...EditProfile,
    exact: true,
    path: "/edit-profile/:_id"
  },
  {
    ...Settings,
    exact: true,
    path: "/settings/:_id"
  },
  {
    ...Register,
    exact: true,
    path: "/register"
  },
  {
    ...UserCollections,
    path: "/user-collections/:userId",
    exact: true
  },
  {
    ...Congratulations,
    path: "/congrats/:mintKey",
    exact: true
  },
  {
    ...BuyCongrats,
    path: "/buy-congrats",
    exact: true
  },
  {
    ...Page404,
    status: 404
  }
  // {
  //   ...Maintenance
  //   // path: "/",
  //   // exact: true
  // }
];

export default [
  {
    ...DefaultLayout,
    routes: SubRoutes
  }
];
