const CACHE_FLAG = false;
const CACHE_VERSION = "v0.1";
const CACHE_NAME_STATIC = `solsea_static_${CACHE_VERSION}`;
const CACHE_NAME_DYNAMIC = `solsea_dynamic_${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";
// const CACHE_ERROR_MESSAGES = "cache_error_messages";
const assets = [
  "/"
  // "/offline.html",
  // "/icons/vr_all_art-small-40.png",
  // "/img/background-artists.jpg",
  // "/img/background-galleries.png",
  // "/img/background-museums.jpg",
  // "/img/background-collectors.jpg",
  // "/img/background-offline.png",
  // "/img/background-not-found.jpg"
];

self.addEventListener("install", evt => {
  CACHE_FLAG &&
    evt.waitUntil(
      caches.open(CACHE_NAME_STATIC).then(cache => {
        cache.addAll(assets);
      })
    );
});

self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(cacheKeys => {
      return Promise.all(
        cacheKeys.map(key => {
          if (
            !CACHE_FLAG ||
            (key !== CACHE_NAME_STATIC && key !== CACHE_NAME_DYNAMIC)
          ) {
            caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", evt => {
  if (CACHE_FLAG && evt.request.url.indexOf("http") === 0) {
    evt.respondWith(
      caches
        .match(evt.request)
        .then(cacheRes => {
          return (
            cacheRes ||
            fetch(evt.request).then(fetchRes => {
              return caches.open(CACHE_NAME_DYNAMIC).then(cache => {
                cache.put(evt.request.url, fetchRes.clone());
                return fetchRes;
              });
            })
          );
        })
        .catch(err => {
          console.log(err);
          return caches.match(OFFLINE_URL);
        })
    );
  }
});
