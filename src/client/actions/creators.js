import client from "../services/feathers";

export const SET_CREATOR_FOR_PAGE = "SET_CREATOR_FOR_PAGE";
export const RESET_CREATOR_PAGE = "RESET_CREATOR_PAGE";
export const SET_HOME_CREATORS = "SET_HOME_CREATORS";
const creatorsUsersService = client.service("creators-users");
const creatorsService = client.service("creators");

export const loadCreator = creatorId => dispatch => {
  return new Promise((resolve, reject) => {
    creatorsUsersService
      .get(creatorId)
      .then(creator => {
        dispatch({
          type: SET_CREATOR_FOR_PAGE,
          payload: creator
        });
        resolve();
      })
      .catch(reject);
  });
};

export const handleLoadCreators = () => dispatch => {
  return new Promise((resolve, reject) => {
    creatorsService
      .find({
        query: {
          "profile.headerImage": { $ne: null },
          "profile.profileImage": { $ne: null },
          $limit: 20
        }
      })
      .then(res => {
        let result = [];
        if (res.length > 12) {
          for (let i = 0; i < 12; ) {
            const rand = Math.floor(Math.random() * res.length);
            if (!result.find(x => x._id === res[rand]._id)) {
              i++;
              result.push(res[rand]);
            }
          }
        } else {
          result = res;
        }
        dispatch({
          type: SET_HOME_CREATORS,
          payload: result
        });
        resolve();
      })
      .catch(reject);
  });
};
