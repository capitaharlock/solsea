import {
  SET_SALES_HISTORY,
  SET_COLLECTION_SALES_HISTORY,
  SET_HOME_SALES_HISTORY
} from "../actions/saleshistory";

const initialState = {
  saleshistory: [],
  recentSales: [],
  collectionSalesHistory: [],
  collectionSalesTotal: 0
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_SALES_HISTORY:
      return {
        ...state,
        saleshistory: action.payload.clear
          ? action.payload.data
          : [...state.saleshistory, ...action.payload.data],
        total: action.payload.total
      };
    case SET_COLLECTION_SALES_HISTORY:
      return {
        ...state,
        collectionSalesHistory: action.payload.clear
          ? action.payload.data
          : [...state.collectionSalesHistory, ...action.payload.data],
        collectionSalesTotal: action.payload.total
      };
    case SET_HOME_SALES_HISTORY:
      return {
        ...state,
        recentSales: action.payload
      };
    default:
      return state;
  }
};
