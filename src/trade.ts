import axios from "axios";
import { ethers } from "ethers";
import { polyDAI, polyMatic } from "./constrants/addresses";
import { polygonChainID } from "./constrants/chainId";
import * as erc20Abi from "./abis/erc20.json";
import { baseTradingAmount } from "./config";

const maticProvider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON_RPC_URL
);
const private_key = process.env.PRIVATE_KEY || "key";
const slippage = 1;
const wallet = new ethers.Wallet(private_key, maticProvider);
const DAI = new ethers.Contract(polyDAI, erc20Abi, maticProvider);

export async function executeTrade(status: number) {
  let nonce = 0;
  let globalData: any;

  let fromTokenAddress = polyDAI;
  let toTokenAddress = polyMatic;
  let amount = ethers.utils.parseUnits("1.0", 18).toString();

  if (status === 1) {
    //   going to buy matic
    const daiBalance = await DAI.balanceOf(wallet.address);
    const hasEnoughAmount = daiBalance.gt(baseTradingAmount);
    if (!hasEnoughAmount) return;
    amount = baseTradingAmount.toString();
    fromTokenAddress = polyDAI;
    toTokenAddress = polyMatic;
  } else {
    //   going to sell matic
    const maticBalance = (await maticProvider.getBalance(wallet.address)).sub(
      ethers.utils.parseEther("0.5")
    );
    const hasEnoughAmount = maticBalance.gt(baseTradingAmount);
    if (!hasEnoughAmount) return;
    amount = baseTradingAmount.toString();
    fromTokenAddress = polyMatic;
    toTokenAddress = polyDAI;
  }

  const callURL =
    "https://api.1inch.exchange/v3.0/" +
    polygonChainID +
    "/swap?" +
    "fromTokenAddress=" +
    fromTokenAddress +
    "&toTokenAddress=" +
    toTokenAddress +
    "&amount=" +
    amount +
    "&fromAddress=" +
    wallet.address +
    "&slippage=" +
    slippage;
  if (
    !(
      callURL.substring(
        callURL.indexOf("fromTokenAddress=") + 17,
        callURL.indexOf("fromTokenAddress=") + 59
      ) === polyMatic
    )
  ) {
    nonce = (await wallet.getTransactionCount()) + 1;
    globalData = await approveApiCaller(amount, polyDAI, nonce);
    try {
      await wallet.sendTransaction(globalData).then((data) => {
        const explorerURL = `https://polygonscan.com/tx/` + data.hash;
        console.log("congrats! your transaction is here", explorerURL);
      });
      console.log("Approval success");
    } catch (e) {
      console.log(e.message);
      console.log("Approval failure");
    }
  }

  nonce = (await wallet.getTransactionCount()) + 1;
  globalData = await apiCaller(callURL, nonce); //call the api to get the data, and wait until it returns

  try {
    await wallet.sendTransaction(globalData).then((data) => {
      const explorerURL = `https://polygonscan.com/tx/` + data.hash;
      console.log("congrats! your transaction is here", explorerURL);
    }); //send the transaction
    console.log("Transaction success");
  } catch (e) {
    console.log("Transaction failure");
  }
}

/**
 * This will call the api to get an approve transaction, some tokens need to be approved to 0 before increasing again later
 * @param {the number of tokens that are requested to be unlocked, if "null" infinite will be unlocked } value
 * @param {the token address of what tokens needs to be unlocked} tokenAddress
 * @param {the nonce of the transaction} nonce
 * @returns approve transaction data
 */
async function approveApiCaller(value: any, tokenAddress: string, _nonce: any) {
  let url =
    "https://api.1inch.exchange/v3.0/" +
    polygonChainID +
    "/approve/calldata" +
    (value > -1 && value != null ? "?amount=" + value + "&" : "") + //tack on the value if it's greater than -1
    "tokenAddress=" +
    tokenAddress;
  let temp: any = await axios
    .get(url)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response.status);
      }
      console.log("Error", error.message);
    });
  let result = temp.data;
  delete result.gasPrice;
  delete result.gas;

  const hexValue = ethers.BigNumber.from(result["value"])._hex;
  result["value"] = hexValue; //add a leading 0x after converting from decimal to hexadecimal

  return result; //return the data
}

/**
 * Will call the api and return the data needed
 * @param {the url of what api call you want} url
 * @param {the nonce of the transaction, the user must keep track of this} nonce
 * @returns swap transaction
 */
async function apiCaller(url: string, _nonce: any) {
  let temp: any = await axios
    .get(url)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response.status);
      }
      console.log("Error", error.message);
    });
  let result = temp.data.tx;

  console.log({ result });
  delete result.gasPrice;
  delete result.gas;

  const hexValue = ethers.BigNumber.from(result["value"])._hex;
  result["value"] = hexValue;

  return result;
}
