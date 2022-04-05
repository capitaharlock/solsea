import { SET_EXPLORE_FILTERS } from "../actions/explore";

const initialState = {
  filters: {},
  defaultFilters: {
    nsfw: false,
    listed: true,
    isPrivateSale: false,
    $limit: 24,
    $sort: {
      createdAt: -1,
      Pubkey: 1
    }
  },
  initialFilters: {
    verified: true
  },
  scrollY: 0
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_EXPLORE_FILTERS:
      return {
        ...state,
        filters: { ...action.payload }
      };

    default:
      return state;
  }
};
