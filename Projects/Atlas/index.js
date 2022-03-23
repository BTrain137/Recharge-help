import { readFile } from "fs/promises";
import dotenv from "dotenv";
import Recharge from "recharge-api-node";
import Shopify from "shopify-api-node";
import neatCsv from "neat-csv";

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

const sleep = (timeInSeconds = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeInSeconds);
  });
};

const main = async () => {
  const data = await readFile(new URL(fileLocation, import.meta.url));
  const csvArr = await neatCsv(data);
  let startNum = 0;
  let endNum = 1;

  for (let i = startNum; i < endNum; i++) {
    // console.log(`Row #${i}`, csvArr[i]);

    const row = csvArr[i];
    const { subscription_id, properties, customer_email } = row;
    const newProductId = +row["NEW Product ID"];
    const newQty = +row["NEW Quantity"];
    const newPrice = +row["NEW price"].replace("$", "");

    // console.log({ newProductId, newQty, newPrice, subscription_id });
    // console.log(properties);

    try {
      const product = await shopify.product.get(newProductId);
      const { variants } = product;
      const variantId = variants[0].id;

      // console.log(product.id);
      // console.log(variantId);

      const subscription = await recharge.subscription.get(subscription_id);
      // console.log(subscription);

      const {
        address_id,
        charge_interval_frequency,
        next_charge_scheduled_at,
        order_interval_frequency,
        order_interval_unit,
      } = subscription;

      // console.log({
      //   address_id: +address_id,
      //   charge_interval_frequency,
      //   next_charge_scheduled_at,
      //   order_interval_frequency,
      //   order_interval_unit,
      //   quantity: newQty,
      //   shopify_variant_id: variantId,
      //   price: newPrice,
      // });

      const endOfWeekDate = new Date("2022-03-28T00:00:00");
      let nextChargeScheduledAt = new Date(next_charge_scheduled_at);
      if (endOfWeekDate > nextChargeScheduledAt) {
        nextChargeScheduledAt.setDate(nextChargeScheduledAt.getDate() + 7);
      }

      nextChargeScheduledAt = `${nextChargeScheduledAt.getFullYear()}-${
        nextChargeScheduledAt.getMonth() + 1
      }-${nextChargeScheduledAt.getDate()}T00:00:00`;

      // console.log(nextChargeScheduledAt);

      // const newSubscription = await recharge.subscription.create({
      //   address_id: +address_id,
      //   charge_interval_frequency,
      //   next_charge_scheduled_at,
      //   order_interval_frequency,
      //   order_interval_unit,
      //   quantity: newQty,
      //   shopify_variant_id: variantId,
      //   price: newPrice,
      // });

      // console.log(newSubscription);

      sleep();
    } catch (error) {
      console.log(`===============================`);
      console.log(`Row #${i}`, customer_email);
      console.log(error);
      console.log(`===============================`);
    }
  }
};

main();
