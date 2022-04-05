import { createWallet } from "all-art-core/lib/core/wallet";
import { store } from "react-notifications-component";
import { CLUSTER_URL } from "../../api/Definitions";
import client from "../services/feathers";
import { SET_REDIRECT } from "./app";
import { SET_WALLET_NFTS } from "./nft";
import React from "react";
import NotificationNftItem from "../components/NotificationNftItem/NotificationNftItem";
import { WalletProviders } from "all-art-core/lib/core/enums";

export const LOGOUT = "LOGOUT";
export const LOGIN = "LOGIN";
export const UPDATE_CURRENT_USER_PROFILE = "UPDATE_CURRENT_USER_PROFILE";
export const WALLET_CONNECTED = "WALLET_CONNECTED";
export const WALLET_DISCONNECTED = "WALLET_DISCONNECTED";
export const LIKES_UPDATED = "LIKES_UPDATED";
export const REPORTS_UPDATED = "REPORTS_UPDATED";
export const NFT_REPORTED = "NFT_REPORTED";
export const COLLECTION_LIKES_UPDATED = "COLLECTION_LIKES_UPDATED";
export const COLLECTION_REPORTS_UPDATED = "COLLECTION_REPORTS_UPDATED";
export const COLLECTION_REPORTED = "COLLECTION_REPORTED";
export const UPDATE_CURRENT_PASSWORD = "UPDATE_CURRENT_PASSWORD";
export const DELETE_USER_PROFILE = "DELETE_USER_PROFILE";
export const SET_HOST = "SET_HOST";
export const SET_USER = "SET_USER";

export const SET_CREATOR = "SET_CREATOR";

const usersService = client.service("users");
const likesService = client.service("user-likes");
likesService.timeout = 60000;
const reportService = client.service("nft-reported");
reportService.timeout = 60000;
const collectionLikesService = client.service("user-collection-likes");
collectionLikesService.timeout = 60000;
const collectionReportService = client.service("collection-reported");
collectionReportService.timeout = 60000;

export const handleLogout = () => dispatch => {
  dispatch({
    type: LOGOUT
  });
};

export const handleLogin = ({ email, password }) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    client
      .authenticate({
        strategy: "local",
        email,
        password
      })
      .then(login => {
        const state = getState();
        dispatch({
          type: LOGIN,
          payload: login
        });
        dispatch({
          type: SET_REDIRECT,
          payload: ""
        });
        resolve({ redirect: state.app.redirect, user: login.user });
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const handleRegister = data => dispatch => {
  return new Promise((resolve, reject) => {
    usersService
      .create({
        email: data.email,
        password: data.password,
        walletKey: data.walletKey
      })
      .then(res => {
        resolve();
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
};

export const handleConnectWallet = provider => (dispatch, getState) => {
	const state = getState();
	const wallet = createWallet(provider, CLUSTER_URL);
	wallet.on("connect", pubkey => {
	  if(provider === WalletProviders.Phantom)
		  localStorage.setItem('isPhantomConnected', 'true');
	  dispatch({
		type: WALLET_CONNECTED,
		payload: {
		  walletKey: pubkey,
		  wallet,
		  walletProvider: provider
		}
	  });
	});
	wallet.on("disconnect", () => {
	  dispatch({
		type: WALLET_DISCONNECTED
	  });
	});
	wallet.connect();
  };
  



export const handleInitialUserData = () => (dispatch, getState) => {
  const reportService = client.service("nft-reported");
  const collectionReportService = client.service("collection-reported");

  const { user } = getState();

  if (user && user.user && user.user._id) {
    loadLikes(user.user._id)
      .then(likes => {
        dispatch({
          type: LIKES_UPDATED,
          payload: likes
        });
      })
      .catch(err => {
        console.log(err);
      });
    loadReports(user.user._id)
      .then(reports => {
        dispatch({
          type: REPORTS_UPDATED,
          payload: reports
        });
      })
      .catch(err => {
        console.log(err);
      });
    loadCollectionLikes(user.user._id)
      .then(likes => {
        dispatch({
          type: COLLECTION_LIKES_UPDATED,
          payload: likes
        });
      })
      .catch(err => {
        console.log(err);
      });
    loadCollectionReports(user.user._id).then(reports => {
      dispatch({
        type: COLLECTION_REPORTS_UPDATED,
        payload: reports
      });
    });
  }
  if (user && user.walletKey) {
    client
      .service("users")
      .patch(user.user._id, {
        $addToSet: {
          userWallets: user.walletKey.toString()
        },
        $set: {
          walletKey: user.walletKey.toString()
        }
      })
      .then(res => {
        dispatch({
          type: SET_USER,
          payload: res
        });
      });
  }

  const walletService = client.service("v1/wallet");

  walletService.on("patched", message => {
    const {
      nfts: { walletListedNfts = [] }
    } = getState();
    let soldNft = null;
    for (let i = 0; i < walletListedNfts.length; i++) {
      const nft = walletListedNfts[i];
      if (!message.listedNfts.find(n => n.Mint === nft.Mint)) {
        soldNft = nft;
        break;
      }
    }

    if (soldNft) {
      const unlisted = message.unlistedNfts.find(n => n.Mint === soldNft.Mint);
      if (unlisted === undefined) {
        store.addNotification({
          container: "top-right",
          content: <NotificationNftItem {...soldNft} status="SOLD" />,
          dismiss: {
            duration: 30000,
            onScreen: false
          }
        });
      }
    }

    dispatch({
      type: SET_WALLET_NFTS,
      payload: {
        listedNfts: message.listedNfts,
        unlistedNfts: message.unlistedNfts
      }
    });
  });

  walletService.on("created", message => {
    dispatch({
      type: SET_WALLET_NFTS,
      payload: {
        listedNfts: message.listedNfts,
        unlistedNfts: message.unlistedNfts
      }
    });
  });
};

export const deleteUser = ({ params, _id }) => dispatch => {
  return new Promise((resolve, reject) => {
    const userService = client.service("users");
    if (_id) {
      userService
        .remove(params._id, {
          query: {}
        })
        .then(res => {
          dispatch({
            type: DELETE_USER_PROFILE,
            payload: res
          });
          resolve();
        })
        .catch(err => {
          console.log(err);
          reject();
        });
    }
  });
};

export const updateUser = ({ data, _id }) => dispatch => {
  return new Promise((resolve, reject) => {
    const userService = client.service("users");
    if (_id) {
      userService
        .patch(_id, {
          $set: {
            profile: {
              ...data
            }
          }
        })
        .then(res => {
          dispatch({
            type: UPDATE_CURRENT_USER_PROFILE,
            payload: res.profile
          });
          resolve();
        })
        .catch(err => {
          reject();
        });
    }
  });
};

export const handleForgotPassword = data => dispatch => {
  return new Promise((resolve, reject) => {
    if (!data || !data.email) {
      reject({
        message: "Email is missing!"
      });
    }
    const forgotPasswordService = client.service("forgot-password");
    forgotPasswordService
      .create({
        email: data.email
      })
      .then(res => {
        resolve();
      })
      .catch(reject);
  });
};

export const handleResetPassword = data => dispatch => {
  return new Promise((resolve, reject) => {
    if (!data || !data.token) {
      reject({
        message: "Token is missing!"
      });
    }

    const forgotPasswordService = client.service("forgot-password");
    forgotPasswordService
      .patch(data.token, {
        password: data.password
      })
      .then(res => {
        resolve();
      })
      .catch(reject);
  });
};

export const loadReports = async userId => {
  if (userId) {
    return await reportService.find({ query: { user: userId } });
  }
  return [];
};

export const loadLikes = async userId => {
  if (userId) {
    return await likesService.find({ query: { user: userId } });
  }
  return [];
};

export const loadCollectionLikes = async userId => {
  if (userId) {
    return await collectionLikesService.find({ query: { user: userId } });
  }
  return [];
};

export const loadCollectionReports = async userId => {
  if (userId) {
    return await collectionReportService.find({ query: { user: userId } });
  }
  return [];
};

export const reloadLikes = () => (dispatch, getState) => {
  return new Promise(resolve => {
    const { user } = getState();

    if (user && user.user && user.user._id) {
      loadLikes(user.user._id).then(likes => {
        dispatch({
          type: LIKES_UPDATED,
          payload: likes
        });
        resolve();
      });
    }
  });
};

export const reloadReports = () => (dispatch, getState) => {
  return new Promise(resolve => {
    const { user } = getState();

    if (user && user.user && user.user._id) {
      loadReports(user.user._id).then(reports => {
        dispatch({
          type: REPORTS_UPDATED,
          payload: reports
        });
        resolve();
      });
    }
  });
};

export const reloadCollectionLikes = () => (dispatch, getState) => {
  return new Promise(resolve => {
    const { user } = getState();
    if (user && user.user && user.user._id) {
      loadCollectionLikes(user.user._id).then(likes => {
        dispatch({
          type: COLLECTION_LIKES_UPDATED,
          payload: likes
        });
        resolve();
      });
    }
  });
};

export const reloadCollectionReports = () => (dispatch, getState) => {
  return new Promise(resolve => {
    const { user } = getState();
    if (user && user.user && user.user._id) {
      loadCollectionReports(user.user._id).then(reports => {
        dispatch({
          type: COLLECTION_REPORTS_UPDATED,
          payload: reports
        });
        resolve();
      });
    }
  });
};
