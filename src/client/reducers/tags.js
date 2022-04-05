import { SET_TAGS } from "../actions/tags";

const initialState = {
  collectionTraits: [],
  tags: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_TAGS:
      return {
        ...state,
        tags: action.payload
      };
    default:
      return state;
  }
};
