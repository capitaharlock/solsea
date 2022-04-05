import client from "../services/feathers";

const nftMintService = client.service("verifiednftmints");
export const SET_NFT_MINTS = "SET_NFT_MINTS";

export const loadTags = () => dispatch => {
  return new Promise((resolve, reject) => {
    // const nftService = client.service("nft-listed");
    nftMintService
      .find()
      .then(res => {
        dispatch({
          type: SET_NFT_MINTS,
          payload: res
        });
        resolve();
      })
      .catch(err => {
        console.log(err);
        reject();
      });
  });
};
