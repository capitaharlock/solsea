// import { func } from "prop-types";
// import Definitions, { ArtPieceStatus, exhibitionTypes } from "./Definitions";

// export function getArtPieceDimensions(artPiece) {
//   if (!artPiece) return "";
//   const {
//     shrType,
//     painting = {},
//     sculpture = {},
//     print = {},
//     drawing = {},
//     photography = {},
//     video = {},
//     streetArt = {},
//     artifact = {}
//   } = artPiece || {};
//   switch (shrType) {
//     case "PAINTING":
//       return painting.width && painting.height
//         ? `${parseDimensions(painting.width)} x ${parseDimensions(
//             painting.height
//           )} cm`
//         : "";
//     case "SCULPTURE":
//       return sculpture.width && sculpture.height && sculpture.length
//         ? `${parseDimensions(sculpture.width)} x ${parseDimensions(
//             sculpture.height
//           )} x ${parseDimensions(sculpture.length)} cm`
//         : "";
//     case "PRINT":
//       return print.width && print.height
//         ? `${parseDimensions(print.width)} x ${parseDimensions(
//             print.height
//           )} cm`
//         : "";
//     case "DRAWING":
//       return drawing.width && drawing.height
//         ? `${parseDimensions(drawing.width)} x ${parseDimensions(
//             drawing.height
//           )} cm`
//         : "";
//     case "PHOTOGRAPHY":
//       return photography.width && photography.height
//         ? `${parseDimensions(photography.width)} x ${parseDimensions(
//             photography.height
//           )} cm`
//         : "";
//     case "VIDEO":
//       return video.width && video.height
//         ? `${parseDimensions(video.width)} x ${parseDimensions(
//             video.height
//           )} cm`
//         : "";
//     case "STREETART":
//       return streetArt.width && streetArt.height && streetArt.length
//         ? `${parseDimensions(streetArt.width)} x ${parseDimensions(
//             streetArt.height
//           )} x ${parseDimensions(streetArt.length)} cm`
//         : "";
//     case "ARTIFACT":
//       return artifact.width && artifact.height && artifact.length
//         ? `${parseDimensions(artifact.width)} x ${parseDimensions(
//             artifact.height
//           )} x ${parseDimensions(artifact.length)} cm`
//         : "";
//     default:
//       return "";
//   }
// }

// export function getArtPieceStatus({ shrStatus }) {
//   const { label = "", value } =
//     ArtPieceStatus.find(x => x.value === shrStatus) || {};
//   const isOnSale =
//     value === "ON_SALE" || value === "ONLINE_SALE" ? true : false;
//   return { status: label, isOnSale };
// }

// export function getArtPiecePrice({ shrPrice, shrCurrency }) {
//   return shrPrice && shrCurrency
//     ? Intl.NumberFormat("en-GB", {
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0,
//         minimumSignificantDigits: 1,
//         style: "currency",
//         currency: shrCurrency
//       }).format(shrPrice)
//     : null;
// }

// export function getImageUrl(fileVersions, verison = "XLIcon") {
//   if (
//     fileVersions &&
//     fileVersions[verison] &&
//     fileVersions[verison].meta &&
//     fileVersions[verison].meta.pipePath
//   )
//     return Definitions.CONTENT_URL + fileVersions[verison].meta.pipePath;
//   return "";
// }

// export function getImageUrlForSEO(fileVersions) {
//   if (
//     fileVersions &&
//     fileVersions.LWRegular &&
//     fileVersions.LWRegular.meta &&
//     fileVersions.LWRegular.meta.pipePath
//   ) {
//     return Definitions.CONTENT_URL + fileVersions.LWRegular.meta.pipePath;
//   }
//   return undefined;
// }
// export function checkDescriptionForSEO(desc = "") {
//   return desc.length <= 170 ? desc : `${desc.substr(0, 166)}...`;
// }

// // TODO set undefiend slug instead of un
// export const getExhibitionSlug = type => {
//   const { slug = "un" } = exhibitionTypes.find(x => x.value === type) || {};
//   return slug;
// };

// export const getOdooCampignFromSearch = search => {
//   const urlParams = new URLSearchParams(search);
//   // console.log(urlParams.entries());
//   const medium = urlParams.get("utm_medium");
//   const campaign = urlParams.get("utm_campaign");
//   const source = urlParams.get("utm_source");
//   return { medium, campaign, source };
// };

// export const handleUserName = user => {
//   if (user.profile && user.profile.firstName && user.profile.lastName) {
//     return user.profile.firstName + " " + user.profile.lastName;
//   } else if (user.email) {
//     return user.email;
//   }
// };
// function parseDimensions(number) {
//   return number % 1 !== 0 ? parseFloat(number).toFixed(1) : number;
// }

// export function isEmptyObj(obj) {
//   for (var prop in obj) {
//     // eslint-disable-next-line no-prototype-builtins
//     if (obj.hasOwnProperty(prop)) {
//       return false;
//     }
//   }
//   return JSON.stringify(obj) === JSON.stringify({});
// }
