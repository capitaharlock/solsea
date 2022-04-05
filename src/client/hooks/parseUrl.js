export function parseUrl(url) {
  if (url.includes("http://") || url.includes("https://")) {
    return url;
  } else {
    return `https://${url}`;
  }
}
