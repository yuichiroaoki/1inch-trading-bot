import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { ethers } from "ethers";
import axios from "axios";
import { polygonChainID } from "./constrants/chainId";
import { IPriveChangeInfo } from "./interfaces/main";
import { minDiff } from "./config";

/**
 * Will call the api and return the current price
 * @param fromTokenAddress token address you're swapping from
 * @param toTokenAddress token address you're swapping to
 * @param amount amount of token you're swappping from
 * @returns the current token price
 */
export async function get1inchPrice(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string = ethers.utils.parseUnits("1.0", 18).toString()
): Promise<number> {
  // sell 1.0 matic
  let callURL =
    "https://api.1inch.exchange/v3.0/" +
    polygonChainID +
    "/quote?" +
    "fromTokenAddress=" +
    fromTokenAddress +
    "&toTokenAddress=" +
    toTokenAddress +
    "&amount=" +
    amount;
  let temp: any = await axios
    .get(callURL)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response.status);
      }
      console.log("Error", error.message);
    }); //get the api call
  let result = temp.data.toTokenAmount; //we only want the data object from the api call

  const rate = ethers.utils.formatUnits(result, 18).slice(0, 9);

  return parseFloat(rate);
}

export function checkPriceMove(
  basePrice: number,
  currentPrice: number
): IPriveChangeInfo {
  const priceChange = (basePrice - currentPrice) / basePrice;
  if (
    basePrice * (1 - minDiff) < currentPrice &&
    currentPrice < basePrice * (1 + minDiff)
  ) {
    return {
      base: basePrice,
      change: priceChange,
      status: 0,
    };
  } else if (basePrice * (1 - minDiff) >= currentPrice) {
    return {
      base: currentPrice,
      change: priceChange,
      status: 1,
    };
  } else {
    return {
      base: currentPrice,
      change: priceChange,
      status: 2,
    };
  }
}
