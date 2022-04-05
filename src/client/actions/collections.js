import client from "../services/feathers";

export const UPDATE_COLLECTION = "UPDATE_COLLECTION";
export const RESET_COLLECTION_PAGE = "RESET_COLLECTION_PAGE";
export const SET_CREATOR_COLLECTIONS = "SET_CREATOR_COLLECTIONS";
export const HOME_PAGE_HOT_COLLECTIONS = "HOME_PAGE_HOT_COLLECTIONS";
export const HOME_PAGE_UPCOMING_COLLECTIONS = "HOME_PAGE_UPCOMING_COLLECTIONS";
export const HOME_PAGE_FRESH_COLLECTIONS = "HOME_PAGE_FRESH_COLLECTIONS";
export const HOME_PAGE_ALL_STARS = "HOME_PAGE_ALL_STARS";
export const HOME_PAGE_TOP_VOLUME = "HOME_PAGE_TOP_VOLUME";
export const HOME_PAGE_UNIQUE_ARTISTS = "HOME_PAGE_UNIQUE_ARTISTS";
export const HOME_PAGE_HOT_ARTISTS = "HOME_PAGE_HOT_ARTISTS";

export function listenCollectionChanges() {
  const collectionService = client.service("collections");
  return dispatch => {
    collectionService.on("created", message => {
      dispatch({
        type: UPDATE_COLLECTION,
        payload: message
      });
    });

    collectionService.on("patched", message => {
      dispatch({
        type: UPDATE_COLLECTION,
        payload: message
      });
    });
    collectionService.on("removed", message => {
      dispatch({
        type: UPDATE_COLLECTION,
        payload: message
      });
    });
  };
}

export const handleCreateCollection = ({ data }) => {
  return new Promise((resolve, reject) => {
    // const collectionService = client.service("collections");
    const collectionValidationService = client.service("collection-validation");

    collectionValidationService
      .create({
        ...data,
        validated: false
      })
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
};

export async function handleHideCollection(data) {
  const collectionService = client.service("collection-validation");
  console.log(data);
  collectionService.patch(data, {
    $set: {
      visible: false
    }
  });
  return null;
}

export async function handleShowCollection(data) {
  const collectionService = client.service("collection-validation");
  collectionService.patch(data, {
    $set: {
      visible: true
    }
  });
  return null;
}

export async function handlePatchCollection(id, data) {
  const collectionService = client.service("collection-validation");
  await collectionService.patch(id, data);
  return null;
}

export async function checkCollectionName(title) {
  const checkNameService = client.service("collection-name-restriction");
  const names = await checkNameService.find({
    query: {
      title: { $regex: `^${title}$`, $options: "i" }
    }
  });
  if (names && names.length > 0) {
    throw new Error("Title is restricted!");
  }
}

export const handleLoadHotCollections = () => dispatch => {
  return new Promise((resolve, reject) => {
    client
      .service("featured")
      .get(HOME_PAGE_HOT_COLLECTIONS)
      .then(result => {
        dispatch({
          type: HOME_PAGE_HOT_COLLECTIONS,
          payload: result.data
        });
        resolve();
      });
  });
};

export const handleLoadUpcomingCollections = () => dispatch => {
  return new Promise((resolve, reject) => {
    client
      .service("featured")
      .get(HOME_PAGE_UPCOMING_COLLECTIONS)
      .then(result => {
        dispatch({
          type: HOME_PAGE_UPCOMING_COLLECTIONS,
          payload: result.data
        });
        resolve();
      });
  });
};

export const handleLoadFreshCollections = () => dispatch => {
  return new Promise(resolve => {
    client
      .service("featured")
      .get(HOME_PAGE_FRESH_COLLECTIONS)
      .then(result => {
        dispatch({
          type: HOME_PAGE_FRESH_COLLECTIONS,
          payload: result.data
        });
        resolve();
      });
  });
};

export const handleLoadAllStars = () => dispatch => {
  return new Promise(resolve => {
    client
      .service("featured")
      .get(HOME_PAGE_ALL_STARS)
      .then(result => {
        dispatch({
          type: HOME_PAGE_ALL_STARS,
          payload: result.data
        });
        resolve();
      });
  });
};

export const handleLoadTopVolume = () => dispatch => {
  return new Promise(resolve => {
    client
      .service("featured")
      .get(HOME_PAGE_TOP_VOLUME)
      .then(result => {
        dispatch({
          type: HOME_PAGE_TOP_VOLUME,
          payload: result.data
        });
        resolve();
      });
  });
};

export const handleLoadUniqueArtists = () => dispatch => {
  return new Promise(resolve => {
    client
      .service("featured")
      .get(HOME_PAGE_UNIQUE_ARTISTS)
      .then(result => {
        dispatch({
          type: HOME_PAGE_UNIQUE_ARTISTS,
          payload: result.data
        });
        resolve();
      });
  });
};

export const handleLoadHotArtists = () => dispatch => {
  return new Promise(resolve => {
    client
      .service("featured")
      .get(HOME_PAGE_HOT_ARTISTS)
      .then(result => {
        dispatch({
          type: HOME_PAGE_HOT_ARTISTS,
          payload: result.data
        });
        resolve();
      });
  });
};
