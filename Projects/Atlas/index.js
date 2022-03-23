import { readFile } from "fs/promises";
import dotenv from "dotenv";
import Recharge from "recharge-api-node";
import Shopify from "shopify-api-node";
import neatCsv from "neat-csv";

import { deleteOneSubscription } from "./controller.js";

dotenv.config();

const {
  RECHARGE_API_KEY,
  RECHARGE_API_SECRETE,
  SHOPIFY_SHOP,
  SHOPIFY_API_KEY,
  SHOPIFY_PASSWORD,
} = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_API_SECRETE,
});

const shopify = new Shopify({
  shopName: SHOPIFY_SHOP,
  apiKey: SHOPIFY_API_KEY,
  password: SHOPIFY_PASSWORD,
});

const fileLocation = "./data/1beancounter_subscriptions_update.csv";

const main = async () => {
  const data = await readFile(new URL(fileLocation, import.meta.url));
  const csvArr = await neatCsv(data);
  let startNum = 0;
  let endNum = 2;

  for (let i = startNum; i < endNum; i++) {
    // console.log(`Row #${i}`, csvArr[i]);
    const row = csvArr[i];
    const { subscription_id } = row;
    const newProductId = +row["NEW Product ID"];
    const newQty = +row["NEW Quantity"];
    const newPrice = +row["NEW price"].replace("$", "");;


    console.log({ newProductId, newQty, newPrice, subscription_id });

    const result = await shopify.product.get(newProductId);
		console.log(result);
  }
};

main();
