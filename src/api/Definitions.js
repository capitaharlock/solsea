export const ROOT_URL = process.env.ROOT_URL;
export const CONTENT_URL = process.env.CONTENT_URL;
// export const API_URL = process.env.API_URL || "https://api.vrallart.com";
export const API_URL = process.env.API_URL || "http://localhost:3030";
export const SSR_API_URL = process.env.SSR_API_URL || "http://localhost:3030";
export const CLUSTER_URL = process.env.CLUSTER_URL || "http://localhost:8899";
export const CONSOLE_LOG = process.env.CONSOLE_LOG ? true : false;

export const STRIPE_PK =
  process.env.STRIPE_PK || "pk_live_BsGAJL8ruT1DaThZDO2x5Lb5";
export const isProduction = process.env.NODE_ENV === "production";
export const isStaging = process.env.STAGING === "staging";

export default {
  ROOT_URL,
  CONTENT_URL
};

export const MAX_REPORT_EXCLUSION_COUNT = 10;

export const SOL_TO_LAMPORTS = 1000000000;
export const FEE_ACCOUNT = "6T4f5bdrd9ffTtehqAj9BGyxahysRGcaUZeDzA1XN52N";
export const ESCROW_PROGRAM_ID = "617jbWo616ggkDxvW1Le8pV38XLbVSyWY8ae6QUmGBAU";
export const AART_KEY = "F3nefJBcejYbtdREjui1T9DPh5dBgpkKq7u2GAAMXs5B";
export const AART_DECIMALS = 1000000;

export const notificationOptions = {
  insert: "top",
  container: "top-right",
  animationIn: ["animate__animated", "animate__fadeIn"],
  animationOut: ["animate__animated", "animate__fadeOut"],
  slidingEnter: {
    duration: 400
  },
  slidingExit: {
    duration: 400
  },
  dismiss: {
    duration: 10000,
    onScreen: false
  }
};

export const listedCountOptions = [
  {
    value: -1,
    label: "filters.all"
  },
  {
    value: 5,
    label: "filters.moreThan5"
  },
  {
    value: 50,
    label: "filters.moreThan50"
  },
  {
    value: 100,
    label: "filters.moreThan100"
  }
];

export const hasNftCollectionOptions = [
  {
    value: {},
    label: "filters.all"
  },
  {
    value: { nft_collection: { $ne: null } },
    label: "filters.inCollection"
  },
  {
    value: { nft_collection: { $eq: null } },
    label: "filters.singlePiece"
  }
];

export const nftCategoryTypes = [
  { value: "image", label: "image" },
  { value: "video", label: "video" },
  { value: "vr", label: "vr" }
];

export const sortOptions = [
  {
    value: { rarity_score: 1 },
    label: "filters.rarityAsc"
  },
  {
    value: { rarity_score: -1 },
    label: "filters.rarityDesc"
  },
  {
    value: { createdAt: 1 },
    label: "filters.createdAsc"
  },
  {
    value: { createdAt: -1 },
    label: "filters.createdDesc"
  },
  {
    value: { listedAt: 1 },
    label: "filters.listedAsc"
  },
  {
    value: { listedAt: -1 },
    label: "filters.listedDesc"
  },
  {
    value: { liked: 1 },
    label: "filters.likesAsc"
  },
  {
    value: { liked: -1 },
    label: "filters.likesDesc"
  },
  {
    value: { views: 1 },
    label: "filters.viewsAsc"
  },
  {
    value: { views: -1 },
    label: "filters.viewsDesc"
  },
  {
    value: { price: 1 },
    label: "filters.priceAsc"
  },
  {
    value: { price: -1 },
    label: "filters.priceDesc"
  }
];

export const nftSortVerification = [
  {
    value: {},
    label: "filters.all"
  },
  {
    value: { verified: true },
    label: "filters.verified"
  }
];

export const statisticsTimeRange = [
  {
    value: { dateRange: 1 },
    label: "filters.dateRange24h"
  },
  {
    value: { dateRange: 7 },
    label: "filters.dateRange7"
  },
  {
    value: { dateRange: 30 },
    label: "filters.dateRange30"
  },
  {
    value: { dateRange: -1 },
    label: "filters.allTime"
  }
];

export const collectionSortOptions = [
  {
    value: { volume: -1 },
    label: "filters.volumeDesc"
  },
  {
    value: { volume: 1 },
    label: "filters.volumeAsc"
  },
  {
    value: { nftCount: -1 },
    label: "filters.listedDesc"
  },
  {
    value: { nftCount: 1 },
    label: "filters.listedAsc"
  },
  {
    value: { liked: -1 },
    label: "filters.likesDesc"
  },
  {
    value: { liked: 1 },
    label: "filters.likesAsc"
  },
  {
    value: { views: -1 },
    label: "filters.viewsDesc"
  },
  {
    value: { views: 1 },
    label: "filters.viewsAsc"
  }
];

export const calendarSortOptions = [
  {
    value: { mintedDate: 1 },
    label: "filters.mintDateAsc"
  },
  {
    value: { mintedDate: -1 },
    label: "filters.mintDateDesc"
  },
  {
    value: { liked: 1 },
    label: "filters.likesAsc"
  },
  {
    value: { liked: -1 },
    label: "filters.likesDesc"
  },
  {
    value: { views: 1 },
    label: "filters.viewsAsc"
  },
  {
    value: { views: -1 },
    label: "filters.viewsDesc"
  },
  {
    value: { initialPrice: 1 },
    label: "filters.priceAsc"
  },
  {
    value: { initialPrice: -1 },
    label: "filters.priceDesc"
  },
  {
    value: { supply: 1 },
    label: "filters.supplyAsc"
  },
  {
    value: { supply: -1 },
    label: "filters.supplyDesc"
  }
];

export const nftSortOptions = [
  {
    value: { price: 1 },
    label: "filters.priceAsc"
  },
  {
    value: { price: -1 },
    label: "filters.priceDesc"
  },
  {
    value: { rarity_rank: 1 },
    label: "filters.rarityRankAsc"
  },
  {
    value: { rarity_rank: -1 },
    label: "filters.rariryRankDesc"
  },
  {
    value: { createdAt: 1 },
    label: "filters.createdAsc"
  },
  {
    value: { createdAt: -1 },
    label: "filters.createdDesc"
  },
  {
    value: { liked: 1 },
    label: "filters.likesAsc"
  },
  {
    value: { liked: -1 },
    label: "filters.likesDesc"
  },
  {
    value: { views: 1 },
    label: "filters.viewsAsc"
  },
  {
    value: { views: -1 },
    label: "filters.viewsDesc"
  },
  {
    value: { listedAt: 1 },
    label: "filters.listedAsc"
  },
  {
    value: { listedAt: -1 },
    label: "filters.listedDesc"
  }
];

export const nftUnlistedSortOptions = [
  {
    value: { rarity_score: 1 },
    label: "filters.rarityRankAsc"
  },
  {
    value: { rarity_score: -1 },
    label: "filters.rariryRankDesc"
  },
  {
    value: { createdAt: 1 },
    label: "filters.createdAsc"
  },
  {
    value: { createdAt: -1 },
    label: "filters.createdDesc"
  }
];

export const statsPageSize = [
  {
    value: { pageSize: 10 },
    label: "10"
  },
  {
    value: { pageSize: 25 },
    label: "25"
  },
  {
    value: { pageSize: 50 },
    label: "50"
  },
  {
    value: { pageSize: 100 },
    label: "100"
  },
  {
    value: { pageSize: 200 },
    label: "200"
  }
];

export const countryList = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Anguilla",
  "Antigua & Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia",
  "Bosnia & Herzegovina",
  "Botswana",
  "Brazil",
  "British Virgin Islands",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Cape Verde",
  "Cayman Islands",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Congo",
  "Cook Islands",
  "Costa Rica",
  "Cote D Ivoire",
  "Croatia",
  "Cruise Ship",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Estonia",
  "Ethiopia",
  "Falkland Islands",
  "Faroe Islands",
  "Fiji",
  "Finland",
  "France",
  "French Polynesia",
  "French West Indies",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Gibraltar",
  "Greece",
  "Greenland",
  "Grenada",
  "Guam",
  "Guatemala",
  "Guernsey",
  "Guinea",
  "Guinea Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Isle of Man",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jersey",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Kyrgyz Republic",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macau",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Montserrat",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Nepal",
  "Netherlands",
  "Netherlands Antilles",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Reunion",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Pierre & Miquelon",
  "Samoa",
  "San Marino",
  "Satellite",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "St Kitts & Nevis",
  "St Lucia",
  "St Vincent",
  "St. Lucia",
  "Sudan",
  "Suriname",
  "Swaziland",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor L'Este",
  "Togo",
  "Tonga",
  "Trinidad & Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Turks & Caicos",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Virgin Islands (US)",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];
