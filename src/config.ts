import { ethers } from "ethers";
import { polygonChainID } from "./constrants/chainId";

//  fixed thresholds for buying and selling
export const threshold = 0.03;

// interval of price check (ms)
export const interval = 60 * 1000;

// amount of DAI token trading per a single buy/sell action
export const baseTradingAmount = ethers.utils.parseUnits("3.0", 18);

export const chainId = polygonChainID;

export const provider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON_RPC_URL
);

export const explorerURL = "https://polygonscan.com";
