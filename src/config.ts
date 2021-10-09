import { ethers } from "ethers";

// every min
export const interval = 2 * 1000;

export const minDiff = 0.01;

export const baseTradingAmount = ethers.utils.parseUnits("3.0", 18);
