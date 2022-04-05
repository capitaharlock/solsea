import { currencies } from "../../api/Currencies";
import { SOL_TO_LAMPORTS } from "../../api/Definitions";

export function parseNFTPrice(price, currency) {
  const currencyData = currencies.find(e => e.value === currency);

  if (currencyData) {
    if (price < currencyData.conversionLimit * SOL_TO_LAMPORTS) {
      return {
        price: price.toFixed(0),
        currency: currencyData.fractionalToken
      };
    } else {
      let newPrice = (price / Math.pow(10, currencyData.decimals)).toFixed(2);
      return { price: newPrice, currency: currencyData.label };
    }
  }
}
