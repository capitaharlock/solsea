import client from "../services/feathers";
import { SET_TAGS } from "./tags";

export const SET_LICENSES = "SET_LICENSES";

export const getLicensesData = () => dispatch => {
  return new Promise((resolve /* reject */) => {
    Promise.all([
      new Promise(resolve => {
        client
          .service("nfttags")
          .find()
          .then(res => resolve(res));
      }),
      // .then(res => {
      //   dispatch({
      //     type: SET_TAGS,
      //     payload: res.data
      //   });
      //   resolve();
      // })
      // .catch(err => {
      //   console.log(err);
      // });
      new Promise(resolve => {
        client
          .service("licenses")
          .find({
            query: {
              $sort: {
                createdAt: 1
              }
            }
          })
          .then(res => resolve(res));
      })
    ]).then(res => {
      dispatch({
        type: SET_LICENSES,
        payload: res[1].data
      });
      dispatch({
        type: SET_TAGS,
        payload: res[0].data
      });
      resolve();
    });
    // .then(res => {
    //   dispatch({
    //     type: SET_LICENSES,
    //     payload: res.data
    //   });
    //   resolve();
    // })
    // .catch(err => {
    //   console.log(err);
    // });
  });
};
