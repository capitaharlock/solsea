import client from "../services/feathers";

const tagService = client.service("nfttags");
export const SET_TAGS = "SET_TAGS";

export const loadTags = () => dispatch => {
  return new Promise((resolve, reject) => {
    // const nftService = client.service("nft-listed");
    tagService
      .find()
      .then(res => {
        dispatch({
          type: SET_TAGS,
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
