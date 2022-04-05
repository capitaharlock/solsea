import {
  RESET_CREATOR_PAGE,
  SET_CREATOR_FOR_PAGE,
  SET_HOME_CREATORS
} from "../actions/creators";

const initialState = {
  creatorPage: null,
  homeCreators: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_CREATOR_FOR_PAGE:
      return { ...state, creatorPage: action.payload };
    case RESET_CREATOR_PAGE:
      return { ...state, creatorPage: null };
    case SET_HOME_CREATORS:
      return { ...state, homeCreators: action.payload };
    default:
      return state;
  }
};
