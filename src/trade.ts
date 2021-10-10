import axios from "axios";
import { ethers } from "ethers";
import { polyDAI, polyMatic } from "./constrants/addresses";
import * as erc20Abi from "./abis/erc20.json";
import { baseTradingAmount, chainId, explorerURL, provider } from "./config";
import { IPriveChangeInfo } from "./interfaces/main";

const private_key = process.env.PRIVATE_KEY;

if (!private_key) {
  throw new Error("Please set your private key in a .env file");
}

const slippage = 1;
const wallet = new ethers.Wallet(private_key, provider);
const ERC20 = new ethers.Contract(polyDAI, erc20Abi, provider);

export async function executeTrade(
  fromTokenAddress: string,
  toTokenAddress: string,
  status: IPriveChangeInfo
) {
  let nonce = 0;
  let globalData: any;

  let amount = ethers.utils.parseUnits("1.0", 18).toString();

  if (status.status === 1) {
    //   going to buy matic
    const erc20Balance = await ERC20.balanceOf(wallet.address);
    const hasEnoughAmount = erc20Balance.gt(baseTradingAmount);
    if (!hasEnoughAmount) return;
    amount = baseTradingAmount.toString();
    fromTokenAddress = polyDAI;
    toTokenAddress = polyMatic;
  } else {
    //   going to sell matic (save 0.5 matic for future transactions)
    const maticBalance = (await provider.getBalance(wallet.address)).sub(
      ethers.utils.parseEther("0.5")
    );
    const base = parseFloat(ethers.utils.formatUnits(baseTradingAmount, 18));
    const tradingMaticAmount = ethers.utils.parseUnits(
      (base / status.base).toString(),
      18
    );

    const hasEnoughAmount = maticBalance.gt(tradingMaticAmount);
    if (!hasEnoughAmount) return;
    amount = tradingMaticAmount.toString();
    fromTokenAddress = polyMatic;
    toTokenAddress = polyDAI;
  }

  const callURL =
    "https://api.1inch.exchange/v3.0/" +
    chainId +
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
        const txURL = `${explorerURL}/tx/${data.hash}`;
        console.log("congrats! your transaction is here", txURL);
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
      const txURL = `${explorerURL}/tx/${data.hash}`;
      console.log("congrats! your transaction is here", txURL);
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
    chainId +
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
