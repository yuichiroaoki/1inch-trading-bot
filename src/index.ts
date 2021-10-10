import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { checkPriceMove, get1inchPrice } from "./inchPrice";
import { executeTrade } from "./trade";
import { baseToken, interval, quoteToken } from "./config";

export const main = async () => {
  // set initial base price to the current price
  let basePrice = await get1inchPrice(baseToken, quoteToken);

  setInterval(async () => {
    const inchprice = await get1inchPrice(baseToken, quoteToken);
    const status = checkPriceMove(basePrice, inchprice);
    console.log(status);
    basePrice = status.base;
    if (status.status !== 0) {
      executeTrade(quoteToken, baseToken, status);
    }
  }, interval);
};

main();
