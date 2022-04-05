import {
  SET_COLLECTION,
  SET_COLLECTION_PAGE,
  SET_CALENDAR_COLLECTION,
  SET_USER_COLLECTION,
  SET_EDIT_COLLECTION,
  SET_HOT_COLLECTIONS,
  HOME_PAGE_INITIAL
} from "../actions/pages";
import {
  COLLECTION_LIKES_UPDATED,
  COLLECTION_REPORTED,
  COLLECTION_REPORTS_UPDATED,
  LOGIN
} from "../actions/user";
import {
  RESET_COLLECTION_PAGE,
  SET_CREATOR_COLLECTIONS,
  UPDATE_COLLECTION,
  HOME_PAGE_HOT_COLLECTIONS,
  HOME_PAGE_UPCOMING_COLLECTIONS,
  HOME_PAGE_FRESH_COLLECTIONS,
  HOME_PAGE_ALL_STARS,
  HOME_PAGE_TOP_VOLUME,
  HOME_PAGE_UNIQUE_ARTISTS,
  HOME_PAGE_HOT_ARTISTS
} from "../actions/collections";

const initialState = {
  collectionPage: null,
  collection: [],
  total: 0,
  hotCollections: [],
  editCollection: { data: {} },
  createCollection: null,
  userCollectionLikes: {},
  userCollectionReports: {},
  creatorCollections: [],
  upcomingCollections: [],
  hotCuratedCollections: [],
  freshCollections: [],
  allStars: [],
  topVolume: [],
  uniqueArtists: [],
  hotArtists: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case COLLECTION_LIKES_UPDATED: {
      if (action.payload) {
        const newLikes = Object.assign(
          {},
          ...action.payload.map(like => ({ [like.collectionId]: { ...like } }))
        );
        let update = {
          userCollectionLikes: newLikes
        };
        if (state.collectionPage) {
          update.collectionPage = checkUserLikeSingleCollection(
            state.collectionPage,
            newLikes
          );
        }
        return { ...state, ...update };
      }
      return state;
    }
    case COLLECTION_REPORTS_UPDATED: {
      if (action.payload) {
        const newReports = Object.assign(
          {},
          ...action.payload.map(report => ({
            [report.collectionId]: { ...report }
          }))
        );

        let update = {
          userCollectionReports: newReports
        };

        if (state.collectionPage) {
          update.collectionPage = checkUserReportSingleCollection(
            state.collectionPage,
            newReports
          );
        }
        return {
          ...state,
          ...update
        };
      }
      return state;
    }
    case SET_CREATOR_COLLECTIONS: {
      // console.log("creator collections", action.payload);
      let update = [];
      if (!action.payload.clear) {
        for (let i = 0; i < action.payload.data.length; i++) {
          const collection = action.payload.data[i];
          if (!state.creatorCollections.find(c => c._id === collection._id)) {
            update.push(collection);
          }
        }
      } else {
        update = action.payload.data;
      }
      return {
        ...state,
        creatorCollections: action.payload.clear
          ? action.payload.data
          : [...state.creatorCollections, ...update],
        creatorTotal: action.payload.total
      };
    }
    case SET_COLLECTION_PAGE: {
      let update = {};

      if (action.payload) {
        update.collectionPage = checkUserLikeSingleCollection(
          action.payload,
          state.userCollectionLikes
        );
        update.collectionPage = checkUserReportSingleCollection(
          action.payload,
          state.userCollectionReports
        );
      }

      return {
        ...state,
        ...update
      };
    }
    case RESET_COLLECTION_PAGE:
      return {
        ...state,
        collectionPage: null
      };

    case SET_USER_COLLECTION:
      return {
        ...state,
        collection: action.payload
      };
    case SET_EDIT_COLLECTION:
      return {
        ...state,
        editCollection: action.payload
      };
    case SET_COLLECTION: {
      let update = [];
      if (!action.payload.clear) {
        for (let i = 0; i < action.payload.data.length; i++) {
          const collection = action.payload.data[i];
          if (!state.collection.find(c => c._id === collection._id)) {
            update.push(collection);
          }
        }
      } else {
        update = action.payload.data;
      }
      return {
        ...state,
        collection: action.payload.clear
          ? action.payload.data
          : [...state.collection, ...update],
        total: action.payload.total
      };
    }

    case SET_HOT_COLLECTIONS:
      return {
        ...state,
        hotCollections: action.payload
      };
    case SET_CALENDAR_COLLECTION:
      return {
        ...state,
        calendarCollections: action.payload,
        total: action.payload.length
      };
    case COLLECTION_REPORTED:
      if (action.payload && action.payload.collections) {
        let update = {};
        let tmp = [...state.collection];
        for (let i = 0; i < tmp.length; i++) {
          const collection = state.collection[i];
          if (action.payload.collections.includes(collection._id)) {
            tmp[i] = {
              ...tmp[i],
              userReported: true
            };
          } else {
            tmp[i] = {
              ...tmp[i],
              userReported: false
            };
          }
        }
        update.collections = [...tmp];

        if (state.collectionPage) {
          if (action.payload.collections.includes(state.collectionPage._id)) {
            update.collectionPage = {
              ...state.collectionPage,
              userReported: true
            };
          } else {
            update.collectionPage = {
              ...state.collectionPage,
              userReported: false
            };
          }
        }
        return {
          ...state,
          ...update
        };
      }
      return state;

    case UPDATE_COLLECTION: {
      const update = {};
      if (
        state.collectionPage &&
        state.collectionPage._id === action.payload._id
      ) {
        update.collectionPage = checkUserLikeSingleCollection(
          action.payload,
          state.userCollectionLikes
        );
      }
      if (state.collection.length > 0) {
        let found = null;
        for (let i = 0; i < state.collection.length; i++) {
          const collection = state.collection[i];
          if (collection._id === action.payload._id) {
            found = i;
            break;
          }
        }
        if (found) {
          update.collection = [...state.collection];
          update.collection[found] = action.payload;
        }
      }

      if (state.hotCollections.length > 0) {
        let found = null;
        for (let i = 0; i < state.hotCollections.length; i++) {
          const collection = state.hotCollections[i];
          if (collection._id === action.payload._id) {
            found = i;
            break;
          }
        }
        if (found) {
          update.hotCollections = [...state.hotCollections];
          update.hotCollections[found] = action.payload;
        }
      }
      return {
        ...state,
        ...update
      };
    }
    case HOME_PAGE_INITIAL: {
      return {
        ...state,
        ...action.payload
      };
    }

    case HOME_PAGE_UPCOMING_COLLECTIONS:
      return { ...state, upcomingCollections: action.payload };

    case HOME_PAGE_HOT_COLLECTIONS:
      return { ...state, hotCuratedCollections: action.payload };

    case HOME_PAGE_FRESH_COLLECTIONS:
      return { ...state, freshCollections: action.payload };

    case HOME_PAGE_ALL_STARS:
      return { ...state, allStars: action.payload };

    case HOME_PAGE_TOP_VOLUME:
      return { ...state, topVolume: action.payload };

    case HOME_PAGE_UNIQUE_ARTISTS:
      return { ...state, uniqueArtists: action.payload };

    case HOME_PAGE_HOT_ARTISTS:
      return { ...state, hotArtists: action.payload };

    default:
      return state;
  }
};

function checkUserLikeSingleCollection(collection, likes = {}) {
  if (likes[collection._id]) {
    collection.userLiked = true;
  } else {
    collection.userLiked = false;
  }
  return collection;
}

function checkUserReportSingleCollection(collection, reports = {}) {
  if (reports[collection._id]) {
    collection.userReported = true;
  } else {
    collection.userReported = false;
  }
  return collection;
}
