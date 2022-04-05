import {
  SET_COLLECTION_NFTS,
  SET_POPULAR_NFTS,
  SET_LISTED_NFTS,
  SET_RECENT_NFTS,
  SET_GOLDEN_NFTS
} from "../actions/pages";

import {
  SET_CREATOR_COLLECTIONS,
  SET_CREATOR_LISTED,
  SET_CREATOR_NFTS,
  SET_CREATOR_UNLISTED
} from "../actions/nft";

import {
  RESET_SINGLE_NFT,
  SET_SINGLE_NFT,
  SET_WALLET_NFTS,
  UPDATE_NFT,
  ADD_TO_CART,
  REMOVE_FROM_CART,
} from "../actions/nft";
import { LIKES_UPDATED, NFT_REPORTED, REPORTS_UPDATED } from "../actions/user";

const initialState = {
  popularNfts: [],
  recentNfts: [],
  listedNfts: [],
  goldenNfts: [],
  collectionNfts: [],
  collectionNftsCount: 0,
  walletListedNfts: [],
  walletUnlistedNfts: [],
  purchases: 0,
  sales: 0,
  profit: 0,
  creatorNfts: [],
  creatorTotal: 0,
  creatorCollections: [],
  userLikes: {},
  userReports: {},
  singleNft: null,
  cartItems: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_POPULAR_NFTS: {
      let update = action.payload;
      for (let i = 0; i < update.length; i++) {
        update[i] = checkUserLikeSingleNft(update[i], state.userLikes);
        update[i] = checkUserReportSingleNft(update[i], state.userReports);
      }
      return {
        ...state,
        popularNfts: update
      };
    }
    case SET_CREATOR_NFTS: {
      let update = [];
      if (!action.payload.clear) {
        for (let i = 0; i < action.payload.data.length; i++) {
          const nft = action.payload.data[i];
          if (!state.collectionNfts.find(n => n.Mint === nft.Mint))
            update.push(nft);
        }
      } else {
        update = action.payload.data;
      }
      for (let i = 0; i < update.length; i++) {
        update[i] = checkUserLikeSingleNft(update[i], state.userLikes);
        update[i] = checkUserReportSingleNft(update[i], state.userReports);
      }
      return {
        ...state,
        creatorNfts: action.payload.clear
          ? action.payload.data
          : [...state.creatorNfts, ...update],
        creatorTotal: action.payload.total
      };
    }

    case SET_LISTED_NFTS: {
      let update = [];
      if (!action.payload.clear) {
        for (let i = 0; i < action.payload.data.length; i++) {
          const nft = action.payload.data[i];
          if (!state.listedNfts.find(n => n.Mint === nft.Mint))
            update.push(nft);
        }
      } else {
        update = action.payload.data;
      }

      //user likes
      for (let i = 0; i < update.length; i++) {
        update[i] = checkUserLikeSingleNft(update[i], state.userLikes);
        update[i] = checkUserReportSingleNft(update[i], state.userReports);
      }

      return {
        ...state,
        listedNfts: action.payload.clear
          ? action.payload.data
          : [...state.listedNfts, ...update],
        total: action.payload.total
      };
    }
    case SET_GOLDEN_NFTS: {
      let update = [];
      if (!action.payload.clear) {
        for (let i = 0; i < action.payload.data.length; i++) {
          const nft = action.payload.data[i];
          if (!state.goldenNfts.find(n => n.Mint === nft.Mint))
            update.push(nft);
        }
      } else {
        update = action.payload.data;
      }

      //user likes
      for (let i = 0; i < update.length; i++) {
        update[i] = checkUserLikeSingleNft(update[i], state.userLikes);
        update[i] = checkUserReportSingleNft(update[i], state.userReports);
      }

      return {
        ...state,
        goldenNfts: action.payload.clear
          ? action.payload.data
          : [...state.goldenNfts, ...update],
        total: action.payload.total
      };
    }
    case SET_COLLECTION_NFTS: {
      let update = [];
      if (!action.payload.clear) {
        update = state.collectionNfts;
        for (let i = 0; i < action.payload.data.length; i++) {
          const nft = action.payload.data[i];
          if (!state.collectionNfts.find(n => n.Mint === nft.Mint))
            update.push(nft);
        }
      } else {
        update = action.payload.data;
      }

      //user likes
      for (let i = 0; i < update.length; i++) {
        update[i] = checkUserLikeSingleNft(update[i], state.userLikes);
        update[i] = checkUserReportSingleNft(update[i], state.userReports);
      }

      return {
        ...state,
        collectionNfts: update,
        collectionNftsCount: action.payload.total
      };
    }
    case SET_RECENT_NFTS: {
      let update = action.payload;
      for (let i = 0; i < update.length; i++) {
        update[i] = checkUserLikeSingleNft(update[i], state.userLikes);
        update[i] = checkUserReportSingleNft(update[i], state.userReports);
      }
      return {
        ...state,
        recentNfts: update
      };
    }
    case RESET_SINGLE_NFT:
      return { ...state, singleNft: null };
    case SET_SINGLE_NFT: {
      let update = {};

      if (action.payload) {
        update.singleNft = checkUserLikeSingleNft(
          action.payload,
          state.userLikes
        );
        update.singleNft = checkUserReportSingleNft(
          action.payload,
          state.userReports
        );
      }
      return { ...state, ...update };
    }
    case UPDATE_NFT: {
      let update = {};
      if (
        action.payload &&
        state.singleNft &&
        state.singleNft.Mint === action.payload.Mint
      ) {
        update.singleNft = checkUserLikeSingleNft(
          action.payload,
          state.userLikes
        );
        update.singleNft = checkUserReportSingleNft(
          action.payload,
          state.userReports
        );
      }
      return {
        ...state,
        ...update
      };
    }
    case LIKES_UPDATED:
      if (action.payload) {
        const newLikes = Object.assign(
          {},
          ...action.payload.map(like => ({
            [like.nft]: { ...like }
          }))
        );

        let update = {
          userLikes: newLikes
        };

        if (state.singleNft) {
          update.singleNft = checkUserLikeSingleNft(state.singleNft, newLikes);
        }
        if (state.listedNfts && state.listedNfts.length > 0) {
          let listedNfts = state.listedNfts;
          for (let i = 0; i < listedNfts.length; i++) {
            listedNfts[i] = checkUserLikeSingleNft(listedNfts[i], newLikes);
          }
          update.listedNfts = listedNfts;
        }
        if (state.popularNfts && state.popularNfts.length > 0) {
          let popularNfts = state.popularNfts;
          for (let i = 0; i < popularNfts.length; i++) {
            popularNfts[i] = checkUserLikeSingleNft(popularNfts[i], newLikes);
          }
          update.popularNfts = popularNfts;
        }
        if (state.recentNfts && state.recentNfts.length > 0) {
          let recentNfts = state.recentNfts;
          for (let i = 0; i < recentNfts.length; i++) {
            recentNfts[i] = checkUserLikeSingleNft(recentNfts[i], newLikes);
          }
          update.recentNfts = recentNfts;
        }

        if (state.collectionNfts && state.collectionNfts.length > 0) {
          let collectionNfts = state.collectionNfts;
          for (let i = 0; i < collectionNfts.length; i++) {
            collectionNfts[i] = checkUserLikeSingleNft(
              collectionNfts[i],
              newLikes
            );
          }
          update.collectionNfts = collectionNfts;
        }
        return {
          ...state,
          ...update
        };
      }
      return state;
    case REPORTS_UPDATED:
      if (action.payload) {
        const newReports = Object.assign(
          {},
          ...action.payload.map(report => ({
            [report.nft]: { ...report }
          }))
        );

        let update = {
          userReports: newReports
        };

        if (state.singleNft) {
          update.singleNft = checkUserReportSingleNft(
            state.singleNft,
            newReports
          );
          // console.log(update.singleNft);
        }
        if (state.listedNfts && state.listedNfts.length > 0) {
          let listedNfts = state.listedNfts;
          for (let i = 0; i < listedNfts.length; i++) {
            listedNfts[i] = checkUserReportSingleNft(listedNfts[i], newReports);
          }
          update.listedNfts = listedNfts;
        }
        if (state.popularNfts && state.popularNfts.length > 0) {
          let popularNfts = state.popularNfts;
          for (let i = 0; i < popularNfts.length; i++) {
            popularNfts[i] = checkUserReportSingleNft(
              popularNfts[i],
              newReports
            );
          }
          update.popularNfts = popularNfts;
        }
        if (state.recentNfts && state.recentNfts.length > 0) {
          let recentNfts = state.recentNfts;
          for (let i = 0; i < recentNfts.length; i++) {
            recentNfts[i] = checkUserReportSingleNft(recentNfts[i], newReports);
          }
          update.recentNfts = recentNfts;
        }

        if (state.collectionNfts && state.collectionNfts.length > 0) {
          let collectionNfts = state.collectionNfts;
          for (let i = 0; i < collectionNfts.length; i++) {
            collectionNfts[i] = checkUserReportSingleNft(
              collectionNfts[i],
              newReports
            );
          }
          update.collectionNfts = collectionNfts;
        }
        return {
          ...state,
          ...update
        };
      }
      return state;
    case SET_WALLET_NFTS:
      return {
        ...state,
        walletListedNfts: action.payload.listedNfts,
        walletUnlistedNfts: action.payload.unlistedNfts,
        purchases: action.payload.purchases,
        sales: action.payload.sales,
        profit: action.payload.profit
      };
    case ADD_TO_CART:
      return {
        ...state,
        cartItems: [...state.cartItems, action.payload]
      };
    case REMOVE_FROM_CART:
      return {
        ...state,
        cartItems: state.cartItems.filter(
          item => item.Mint !== action.payload.Mint
        )
    }
    default:
      return state;
  }
};

function checkUserLikeSingleNft(nft, likes = {}) {
  if (likes[nft.Mint]) {
    nft.userLiked = true;
  } else {
    nft.userLiked = false;
  }
  return nft;
}

function checkUserReportSingleNft(nft, reports = {}) {
  if (reports[nft.Mint]) {
    nft.userReported = true;
  } else {
    nft.userReported = false;
  }
  return nft;
}
