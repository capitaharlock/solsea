import client from "../services/feathers";

const historyService = client.service("listed-archive");
export const SET_SALES_HISTORY = "SET_SALES_HISTORY";
export const SET_COLLECTION_SALES_HISTORY = "SET_COLLECTION_SALES_HISTORY";
export const SET_HOME_SALES_HISTORY = "SET_HOME_SALES_HISTORY";

export const loadHistory = () => dispatch => {
  return new Promise((resolve, reject) => {
    historyService
      .find({
        query: {
          status: "SOLD",
          $sort: {
            createdAt: -1
          },
          $limit: 40
        },
        $populate: ["image"]
      })
      .then(res => {
        dispatch({
          type: SET_SALES_HISTORY,
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
