import { SET_NFT_MINTS } from "../actions/mints";
import { SET_COLLECTION_MINTS } from "../actions/pages";

const initialState = {
  mints: [],
  collectionMints: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_NFT_MINTS:
      return {
        ...state,
        mints: action.payload
      };
    case SET_COLLECTION_MINTS:
      return {
        ...state,
        collectionMints: action.payload
      };

    default:
      return state;
  }
};
