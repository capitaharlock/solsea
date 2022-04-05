import { SET_COLLECTION_STATISTICS } from "../actions/collection-statistics";

const initialState = {
  collectionStatistics: [],
  total: 0
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_COLLECTION_STATISTICS:
      return {
        ...state,
        collectionStatistics: action.payload.data,
        total: action.payload.total
      };
    default:
      return state;
  }
};
