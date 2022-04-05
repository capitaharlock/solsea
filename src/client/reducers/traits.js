import { SET_COLLECTION_TRAITS } from "../actions/traits";

const initialState = {
  collectionTraits: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_COLLECTION_TRAITS:
		return {
        ...state,
        collectionTraits: action.payload
      };
    default:
      return state;
  }
};
