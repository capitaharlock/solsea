import client from "../services/feathers";

const statisticsService = client.service("collection-statistics");
export const SET_COLLECTION_STATISTICS = "SET_COLLECTION_STATISTICS";

export const loadStatistics = () => dispatch => {
  return new Promise((resolve, reject) => {
    statisticsService
      .get()
      .then(res => {
        dispatch({
          type: SET_COLLECTION_STATISTICS,
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
