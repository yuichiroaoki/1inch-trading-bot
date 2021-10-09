import { ethers } from "ethers";
import { polygonChainID } from "../constrants/chainId";

// every min
export const interval = 60 * 1000;

export const threshold = 0.01;

export const baseTradingAmount = ethers.utils.parseUnits("3.0", 18);

export const chainId = polygonChainID;
