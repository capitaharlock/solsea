import {
  IS_INITIAL_RENDER,
  IS_EXPLORE,
  SET_BUTTON_ID,
  SET_OPEN_FORM,
  SET_SELECTED_PLAN,
  SET_REDIRECT,
  SET_OPEN_NFT,
  SYSTEM_UPDATED,
  SET_COLLECTION_FOR_VALIDATION,
  SET_DARK_MODE,
  TOGGLE_WALLET
} from "../actions/app";
import { defaultCluster } from "all-art-core/lib/core/consts";
// import { WalletProviders } from "all-art-core/lib/core/enums";
// import { createWallet } from "all-art-core/lib/core/wallet";

const initialState = {
  isInitialRender: true,
  cluster: defaultCluster,
  wallet: null,
  redirect: "",
  openNft: false,
  system: {},
  selectedForValidation: "",
  isDarkMode: true,
  isWalletOpen: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_DARK_MODE:
      return {
        ...state,
        isDarkMode: action.value
      };

    case IS_INITIAL_RENDER:
      return {
        ...state,
        isInitialRender: action.isInitialRender
      };

    case IS_EXPLORE:
      return {
        ...state,
        isExplore: action.value
      };

    case SET_BUTTON_ID:
      return {
        ...state,
        buttonId: action.value
      };

    case SET_OPEN_FORM:
      return {
        ...state,
        openForm: action.value
      };

    case SET_OPEN_NFT:
      return {
        ...state,
        openNft: action.value
      };

    case SET_SELECTED_PLAN:
      return {
        ...state,
        plan: action.value
      };

    case SET_REDIRECT:
      return {
        ...state,
        redirect: action.payload
      };
    case SYSTEM_UPDATED:
      return {
        ...state,
        system: action.payload
      };
    case SET_COLLECTION_FOR_VALIDATION:
      return {
        ...state,
        selectedForValidation: action.value
      };
    case TOGGLE_WALLET:
      return {
        ...state,
        isWalletOpen: !state.isWalletOpen
      };
    default:
      return state;
  }
};
