import client from "../services/feathers";

const walletService = client.service("/v1/wallet");
walletService.timeout = 60000;
const listNftService = client.service("/nft-listed");
listNftService.timeout = 60000;
const fetchNftService = client.service("fetch-nft");
listNftService.timeout = 60000;
const escrowService = client.service("escrow");
escrowService.timeout = 60000;
const collectionService = client.service("collections");
collectionService.timeout = 60000;

export const RESET_SINGLE_NFT = "RESET_SINGLE_NFT";
export const SET_SINGLE_NFT = "SET_SINGLE_NFT";
export const UPDATE_NFT = "UPDATE_NFT";
export const SET_WALLET_NFTS = "SET_WALLET_NFTS";
export const SET_CREATOR_NFTS = "SET_CREATOR_NFTS";
export const ADD_TO_CART = "ADD_TO_CART";
export const REMOVE_FROM_CART = "REMOVE_FROM_CART";

export function listenNftChanges() {
  return dispatch => {
    listNftService.on("created", message => {
      dispatch({
        type: UPDATE_NFT,
        payload: message
      });
    });

    listNftService.on("patched", message => {
      dispatch({
        type: UPDATE_NFT,
        payload: message
      });
    });
    listNftService.on("removed", message => {
      dispatch({
        type: UPDATE_NFT,
        payload: message
      });
    });
  };
}

export const loadSingleNft = ({ pubkey }) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    fetchNftService
      .get(pubkey, {
        query: {
          $populate: ["image"]
        }
      })
      .then(res => {
        dispatch({
          type: SET_SINGLE_NFT,
          payload: res
        });
        resolve();
      })
      .catch(err => {
        reject();
      });
  });
};

export async function handleDelistNFT(escrowKey, buffer) {
  return await client.service("escrow").update(escrowKey, {
    buffer
  });
}

export async function handleBuyNFT({ escrow, buyer, buffer }) {
  return await escrowService.patch(escrow, {
    buffer,
    buyer
  });
}

export const handleResetSingleNft = () => dispatch => {
  dispatch({
    type: RESET_SINGLE_NFT
  });
};

export const addToCart = payload => dispatch => {
  dispatch({
    type: ADD_TO_CART,
    payload
  });
};

export const removeFromCart = payload => dispatch => {
  dispatch({
    type: REMOVE_FROM_CART,
    payload
  });
};

export const handleGetWalletNfts = ({ query }) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();

    walletService
      // .get("7YNKWyPW5iqu1QHqnQ5Csj9yWpEEnqAzLcuzudMMHqbk")
      .get(state.user.walletKey.toString(), { query })
      .then((res = []) => {
        dispatch({
          type: SET_WALLET_NFTS,
          payload: {
            listedNfts: res.listedNfts,
            unlistedNfts: res.unlistedNfts,
            purchases: res.purchases,
            sales: res.sales,
            profit: res.profit
          }
        });
        // }
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const handleReloadWallet = () => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState();
    walletService
      .get(state.user.walletKey.toString(), {
        query: {
          reload: true
        }
      })
      .then(res => {
        dispatch({
          type: SET_WALLET_NFTS,
          payload: {
            listedNfts: res.listedNfts || [],
            unlistedNfts: res.unlistedNfts || []
          }
        });
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
};
