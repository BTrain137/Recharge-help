import { readFile } from "fs/promises";
import dotenv from "dotenv";
import Recharge from "recharge-api-node";
import neatCsv from "neat-csv";

import { deleteOneSubscription } from "./controller.js";

dotenv.config();

const { RECHARGE_API_KEY, RECHARGE_API_SECRETE } = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_API_SECRETE,
});

const fileLocation = "./data/1beancounter_subscriptions_update.csv";

const main = async () => {
  const data = await readFile(new URL(fileLocation, import.meta.url));
  const csvArr = await neatCsv(data);
  for (let i = 0; i < csvArr.length; i++) {
    console.log(`Row #${i}`, csvArr[i]);
  }
};

main();
