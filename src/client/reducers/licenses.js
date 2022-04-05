import { SET_LICENSES } from "../actions/licenses";

const initialState = {
  license: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_LICENSES:
      return {
        ...state,
        license: action.payload
      };
    default:
      return state;
  }
};
