import { ethers } from "ethers";

// every min
export const interval = 2 * 1000;

//  fixed thresholds for buying and selling
export const threshold = 0.03;

export const baseTradingAmount = ethers.utils.parseUnits("3.0", 18);
