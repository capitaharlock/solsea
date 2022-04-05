import { Profiler } from "react";
import { isProduction } from "../../api/Definitions";
import client from "../services/feathers";
import { SET_COLLECTION_STATISTICS } from "./collection-statistics";
import {
  HOME_PAGE_ALL_STARS,
  HOME_PAGE_FRESH_COLLECTIONS,
  HOME_PAGE_HOT_ARTISTS,
  HOME_PAGE_HOT_COLLECTIONS,
  HOME_PAGE_TOP_VOLUME,
  HOME_PAGE_UNIQUE_ARTISTS,
  HOME_PAGE_UPCOMING_COLLECTIONS,
  SET_CREATOR_COLLECTIONS
} from "./collections";
import { loadCreator, SET_HOME_CREATORS } from "./creators";
import { SET_LICENSES } from "./licenses";
import {
  SET_CREATOR_LISTED,
  SET_CREATOR_NFTS,
  SET_CREATOR_UNLISTED,
  SET_SINGLE_NFT
} from "./nft";
import {
  loadHistory,
  SET_COLLECTION_SALES_HISTORY,
  SET_HOME_SALES_HISTORY,
  SET_SALES_HISTORY
} from "./saleshistory";
import { SET_TAGS } from "./tags";
import { mapTraits, SET_COLLECTION_TRAITS } from "./traits";
import { SET_CREATOR, SET_USER } from "./user";

export const SET_HOT_COLLECTIONS = "SET_HOT_COLLECTIONS";
export const SET_POPULAR_NFTS = "SET_POPULAR_NFTS";
export const SET_COLLECTION_PAGE = "SET_COLLECTION_PAGE";
export const SET_COLLECTION_NFTS = "SET_COLLECTION_NFTS";
export const SET_COLLECTION = "SET_COLLECTION";
export const SET_EDIT_COLLECTION = "SET_EDIT_COLLECTION";
export const SET_USER_COLLECTION = "SET_USER_COLLECTION";
export const SET_CALENDAR_COLLECTION = "SET_CALENDAR_COLLECTION";
export const SET_LISTED_NFTS = "SET_LISTED_NFTS";
export const SET_GOLDEN_NFTS = "SET_GOLDEN_NFTS";
export const SET_RECENT_NFTS = "SET_RECENT_NFTS";
export const SET_COLLECTION_MINTS = "SET_COLLECTION_MINTS";
export const HOME_PAGE_INITIAL = "HOME_PAGE_INITIAL";

export const getNftExploreData = (params, req) => dispatch => {
  return new Promise((resolve, reject) => {
    const ip = isProduction ? req.headers["x-forwarded-for"] : req.ip || "";
    const headers = {};
    if (ip) headers["x-user-ip"] = ip;
    Promise.all([
      client.service("nft-listed").find({
        query: {
          nsfw: false,
          listed: true,
          verified: true,
          isPrivateSale: false,
          ignoreStakeSort: true,
          $limit: 24,
          $sort: {
            createdAt: -1
          }
        },
        headers
      }),
      client.service("nfttags").find({
        headers
      }),
      client.service("licenses").find({
        headers
      }),
      client.service("nft-listed").find({
        query: {
          nsfw: false,
          listed: true,
          verified: true,
          isPrivateSale: false,
          $limit: 24,
          stakeAmount: { $gt: 0 },
          $sort: {
            createdAt: -1
          }
        },
        headers
      }),
    ])
      .then(res => {
        dispatch({
          type: SET_LISTED_NFTS,
          payload: {
            clear: true,
            data: res[0].data,
            total: res[0].total
          }
        });
        dispatch({
          type: SET_TAGS,
          payload: {
            clear: true,
            data: res[1].data
          }
        });
        dispatch({
          type: SET_LICENSES,
          payload: {
            clear: true,
            data: res[2].data
          }
        });
        dispatch({
          type: SET_GOLDEN_NFTS,
          payload: {
            clear: true,
            data: res[3].data,
            total: res[3].total
          }
        });
        resolve();
      })
      .catch(reject);
  });
};

export const getHomeData = (params, req) => dispatch => {
  return new Promise((resolve, reject) => {
    const ip = isProduction ? req.headers["x-forwarded-for"] : req.ip || "";
    const headers = {};
    if (ip) headers["x-user-ip"] = ip;
    Promise.all([
      client.service("nft-listed").find({
        query: {
          nsfw: { $in: [false, null] },
          verified: true,
          listed: true,
          isPrivateSale: false,
          $limit: 14,
          views: { $gt: 100 }
          // $sort: {
          //   liked: -1
          // }
        },
        headers
      }),
      client.service("nft-listed").find({
        query: {
          nsfw: { $in: [false, null] },
          listed: true,
          isPrivateSale: false,
          $limit: 14,
          ignoreStakeSort: true,
          $sort: {
            listedAt: -1
          }
        },
        headers
      }),
      client.service("collections").find({
        query: {
          visible: true,
          $limit: 20,
          _id: {
            $nin: [
              "615343ac3518e0372834fb05",
              "61644a9f8ef27001d27d8376",
              "615eb145e7d857bc395d2dff",
              "6162f8aa174811017a4e2187"
            ]
          },
          views: { $gt: 100 },
          // $sort: {
          //   liked: -1
          // },
          $populate: ["headerImage", "iconImage"]
        },
        headers
      }),
      client.service("listed-archive").find({
        query: {
          status: "SOLD",
          $sort: {
            createdAt: -1
          },
          listed: false,
          $limit: 6
        },
        $populate: ["image"]
      }),
      client.service("featured").get(HOME_PAGE_UPCOMING_COLLECTIONS),
      client.service("featured").get(HOME_PAGE_HOT_COLLECTIONS),
      client.service("featured").get(HOME_PAGE_FRESH_COLLECTIONS),
      client.service("featured").get(HOME_PAGE_ALL_STARS),
      client.service("featured").get(HOME_PAGE_TOP_VOLUME),
      client.service("featured").get(HOME_PAGE_UNIQUE_ARTISTS),
      client.service("featured").get(HOME_PAGE_HOT_ARTISTS)
    ])
      .then(res => {
        let result = [];
        if (res[0].data.length > 14) {
          for (let i = 0; i < 14; ) {
            const rand = Math.floor(Math.random() * res[0].data.length);
            if (!result.find(x => x.Pubkey === res[0].data[rand].Pubkey)) {
              i++;
              result.push(res[0].data[rand]);
            }
          }
        } else {
          result = res[0].data;
        }

        dispatch({
          type: SET_POPULAR_NFTS,
          payload: result
        });

        dispatch({
          type: SET_RECENT_NFTS,
          payload: res[1].data
        });

        result = [];
        if (res[2].data.length > 6) {
          for (let i = 0; i < 6; ) {
            const rand = Math.floor(Math.random() * res[2].data.length);
            if (!result.find(x => x._id === res[2].data[rand]._id)) {
              i++;
              result.push(res[2].data[rand]);
            }
          }
        } else {
          result = res[2].data;
        }

        dispatch({
          type: SET_HOT_COLLECTIONS,
          payload: result
        });
        dispatch({
          type: SET_HOME_SALES_HISTORY,
          payload: res[3].data
        });

        dispatch({
          type: HOME_PAGE_INITIAL,
          payload: {
            upcomingCollections: res[4].data,
            hotCollections: res[5].data,
            freshCollections: res[6].data,
            allStars: res[7].data,
            topVolume: res[8].data,
            uniqueArtists: res[9].data,
            hotArtists: res[10].data
          }
        });
        resolve();
      })
      .catch(err => {
        console.log(err.message);
        reject(err);
      });
  });
};

export const getCollectionPageData = (params, req) => dispatch => {
  console.log("getCollectionPageData", params._id);
  const ip = isProduction ? req.headers["x-forwarded-for"] : req.ip || "";
  const headers = {};
  if (ip) headers["x-user-ip"] = ip;
  return new Promise((resolve, reject) => {
    Promise.all([
      client.service("collections").get(params._id, {
        query: {
          $populate: ["headerImage", "iconImage"]
        },
        headers
      }),
      client.service("nft-listed").find({
        query: {
          nsfw: { $in: [false, null] },
          nft_collection: params._id,
          isPrivateSale: false,
          $limit: 24
          // verified: true
        }
      }),
      client.service("/v1/traits").find({
        query: {
          nft_collection: params._id
        }
      }),
      client.service("licenses").find({}),
      client.service("nfttags").find({}),
      client.service("listed-archive").find({
        query: {
          status: "SOLD",
          $sort: {
            createdAt: -1
          },
          listed: false,
          nft_collection: params._id,
          $limit: 12
        },
        $populate: ["image"]
      })
    ])
      .then(res => {
        dispatch({
          type: SET_COLLECTION_PAGE,
          payload: res[0]
        });
        dispatch({
          type: SET_COLLECTION_NFTS,
          payload: {
            clear: true,
            data: res[1].data,
            total: res[1].total
          }
        });
        dispatch({
          type: SET_COLLECTION_TRAITS,
          payload: mapTraits(res[2])
        });
        dispatch({
          type: SET_LICENSES,
          payload: res[3].data
        });
        dispatch({
          type: SET_TAGS,
          payload: res[4].data
        });
        dispatch({
          type: SET_COLLECTION_SALES_HISTORY,
          payload: {
            data: res[5].data,
            total: res[5].data.length
          }
        });
        resolve();
      })
      .catch(reject);
  });
};

export const getNftPageData = (params, req) => dispatch => {
  const nftService = client.service("fetch-nft");
  const creatorsService = client.service("creators-users");
  const ip = isProduction ? req.headers["x-forwarded-for"] : req.ip || "";
  const headers = {};
  if (ip) headers["x-user-ip"] = ip;
  return new Promise((resolve, reject) => {
    Promise.all([
      nftService.get(params.pubkey, {
        headers
      }),
      creatorsService.find({
        query: {
          mint: params.pubkey
        }
      })
    ])
      .then(res => {
        dispatch({
          type: SET_SINGLE_NFT,
          payload: res[0]
        });
        dispatch({
          type: SET_CREATOR,
          payload: res[1]
        });
        resolve();
      })

      .catch(err => {
        console.log(err);
        reject();
      });
  });
};

export const handleCreatorPage = params => dispatch => {
  const creatorsNftsService = client.service("creators-nfts");
  const creatorsService = client.service("creators-users");
  const collectionService = client.service("collections");
  return new Promise((resolve, reject) => {
    Promise.all([
      creatorsNftsService.get(params._id, {
        query: {
          isPrivateSale: false,
          $skip: 0,
          $limit: 20
        }
      }),
      collectionService.find({
        query: {
          user: { $in: params._id },
          $populate: ["headerImage", "iconImage"]
        }
      }),
      loadCreator(params._id)
    ])
      .then(res => {
        dispatch({
          type: SET_CREATOR_NFTS,
          payload: {
            clear: true,
            data: res[0].data,
            total: res[0].total
          }
        });
        dispatch({
          type: SET_CREATOR_COLLECTIONS,
          payload: {
            clear: true,
            data: res[1].data,
            total: res[1].total
          }
        });
        resolve();
      })
      .catch(err => {
        console.log(err);
        reject();
      });
  });
};

export const getCalendarCollectionData = (params, req) => dispatch => {
  const ip = isProduction ? req.headers["x-forwarded-for"] : req.ip || "";
  const headers = {};
  if (ip) headers["x-user-ip"] = ip;
  return new Promise((resolve, reject) => {
    Promise.all([
      client.service("collections").find({
        query: {
          visible: true,
          mintedDate: { $gte: new Date().toISOString() },
          $sort: { mintedDate: 1 },
          $populate: ["headerImage", "iconImage"]
        }
      }),
      client.service("nfttags").find({
        headers
      })
    ])
      .then(res => {
        dispatch({
          type: SET_CALENDAR_COLLECTION,
          payload: res[0].data
        });
        dispatch({
          type: SET_TAGS,
          payload: { clear: true, data: res[1].data }
        });
        resolve(res);
      })
      .catch(reject);
  });
};

export const getCollectionData = (params, req) => dispatch => {
  const ip = isProduction ? req.headers["x-forwarded-for"] : req.ip || "";
  const headers = {};
  if (ip) headers["x-user-ip"] = ip;
  return new Promise((resolve, reject) => {
    Promise.all([
      client.service("collections").find({
        query: {
          visible: true,
          verified: true,
          $limit: 21,
          $sort: { createdAt: -1 },
          $populate: ["headerImage", "iconImage"]
        },
        headers
      }),
      client.service("nfttags").find({
        headers
      })
    ])
      .then(res => {
        dispatch({
          type: SET_COLLECTION,
          payload: {
            clear: true,
            data: res[0].data,
            total: res[0].total
          }
        });
        dispatch({
          type: SET_TAGS,
          payload: { clear: true, data: res[1].data }
        });
        resolve();
      })
      .catch(reject);
  });
};

export const getCollectionStatistics = (params, req) => dispatch => {
  return new Promise((resolve, reject) => {
    const date = new Date(new Date().getTime() - 21 * 24 * 60 * 60 * 1000);
    client
      .service("collection-statistics")
      .find({
        query: {
          dateRange: 1
        }
      })
      .then(res => {
        dispatch({
          type: SET_COLLECTION_STATISTICS,
          payload: {
            clear: true,
            data: res,
            total: 0
          }
        });

        resolve();
      })
      .catch(reject);
  });
};

export const getEditCollectionData = (params, req) => dispatch => {
  const ip = isProduction ? req.headers["x-forwarded-for"] : req.ip || "";
  return new Promise((resolve, reject) => {
    client
      .service("nfttags")
      .find()
      .then(res => {
        dispatch({
          type: SET_TAGS,
          payload: res.data
        });
        resolve();
      })
      .catch(reject);
  });
};

export const getUserCollectionData = (params, req) => dispatch => {
  const ip = isProduction ? req.headers["x-forwarded-for"] : req.ip || "";
  const headers = {};
  if (ip) headers["x-user-ip"] = ip;
  return new Promise((resolve, reject) => {
    Promise.all([
      client.service("collections").find({
        query: {
          user: params,
          $populate: ["headerImage", "iconImage"]
        },
        headers
      }),
      client.service("users").get(params, {
        headers
      })
    ])
      .then(res => {
        dispatch({
          type: SET_USER_COLLECTION,
          payload: res[0].data
        });
        dispatch({
          type: SET_USER,
          payload: {
            clear: true,
            data: res[1]
          }
        });
      })
      .catch(reject);
  });
};

export const getCollectionValidationData = (params, req) => dispatch => {
  // const ip = isProduction ? req.headers["x-forwarded-for"] : req.ip;
  return new Promise((resolve, reject) => {
    Promise.all([
      client.service("collections").find({
        query: {
          user: params,
          $populate: ["headerImage", "iconImage"]
        }
        // headers: { "x-user-ip": ip }
      })
    ])
      .then(res => {
        dispatch({
          type: SET_USER_COLLECTION,
          payload: res[0].data
        });
      })
      .catch(reject);
  });
};
