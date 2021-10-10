import { ethers } from "ethers";
import { polygonChainID } from "./constrants/chainId";

//  fixed thresholds for buying and selling
export const threshold = 0.03;

// every min
export const interval = 60 * 1000;

export const baseTradingAmount = ethers.utils.parseUnits("3.0", 18);

export const chainId = polygonChainID;

export const provider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON_RPC_URL
);

export const explorerURL = "https://polygonscan.com";
