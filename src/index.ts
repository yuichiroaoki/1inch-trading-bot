import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { checkPriceMove, get1inchPrice } from "./inchPrice";
import { executeTrade } from "./trade";
import { interval } from "./config";
import { polyDAI, polyMatic } from "./constrants/addresses";

export const main = async () => {
  // set initial base price to the current price
  let basePrice = await get1inchPrice(polyMatic, polyDAI);

  setInterval(async () => {
    const inchprice = await get1inchPrice(polyMatic, polyDAI);
    const status = checkPriceMove(basePrice, inchprice);
    console.log(status);
    basePrice = status.base;
    if (status.status !== 0) {
      executeTrade(polyDAI, polyMatic, status);
    }
  }, interval);
};

main();
