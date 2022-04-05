import {
  LOGOUT,
  LOGIN,
  WALLET_CONNECTED,
  WALLET_DISCONNECTED,
  SET_USER,
  UPDATE_CURRENT_USER_PROFILE,
  UPDATE_CURRENT_PASSWORD,
  DELETE_USER_PROFILE,
  SET_CREATOR
} from "../actions/user";
import { SystemProgram } from "@solana/web3.js";
const initialState = {
  isLoggedIn: false,
  walletKey: SystemProgram.programId,
  wallet: null,
  setUser: null,
  setHost: [],
  reports: [],
  setCreator: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload.user
      };
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false
      };
    case WALLET_CONNECTED:
      return {
        ...state,
        walletKey: action.payload.walletKey,
        wallet: action.payload.wallet,
        connected: true
      };

    case WALLET_DISCONNECTED:
      return {
        ...state,
        walletKey: null,
        wallet: null,
        connected: false
      };

    case SET_USER:
      return {
        ...state,
        user: action.payload
      };

    case SET_CREATOR:
      return {
        ...state,
        setCreator: action.payload
      };

    case UPDATE_CURRENT_USER_PROFILE:
      return {
        ...state,
        user: {
          ...state.user,
          profile: action.payload
        }
      };

    case UPDATE_CURRENT_PASSWORD:
      return {
        ...state,
        user: {
          ...state.user,
          password: action.payload
        }
      };
    case DELETE_USER_PROFILE:
      return {
        ...state,
        user: {
          ...state.user,
          user: action.payload
        }
      };
    default:
      return state;
  }
};
