import React from "react";
import { Helmet } from "react-helmet";

const urlFix = path => {
  if (!path) return "";
  return path.startsWith("http")
    ? path
    : process.env.ROOT_URL +
        "/" +
        (path.startsWith("/") ? path.slice(1) : path);
};

const Seo = ({ title, imageUrl, description, url }) => {
  url = urlFix(url);
  imageUrl = urlFix(imageUrl);

  return (
    <Helmet>
      <title>{title}</title>
      <link rel="canonical" href={url} />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content="SolSea" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content="SolSea" />
      <meta property="og:url" content={url} />
      <meta property="og:description" content={description} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:image" content={imageUrl} />
      <meta property="twitter:description" content={description} />
    </Helmet>
  );
};

export default Seo;
