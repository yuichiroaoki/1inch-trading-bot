import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { ethers } from "ethers";
import axios from "axios";
import { polygonChainID } from "./constrants/chainId";
import { polyDAI, polyMatic } from "./constrants/addresses";
import { IPriveChangeInfo } from "./interfaces/main";
import { minDiff } from "./config";

const fromTokenAddress = polyMatic;
const toTokenAddress = polyDAI;
const amount = ethers.utils.parseUnits("1.0", 18).toString();

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

/**
 * Will call the api and return the data needed
 * @param {the url of what api call you want} url
 * @returns swap transaction
 */
export async function get1inchPrice() {
  // export async function get1inchPrice(url: string) {
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
