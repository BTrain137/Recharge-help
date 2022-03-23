import { readFile } from "fs/promises";
import dotenv from "dotenv";
import Recharge from "recharge-api-node";
import Shopify from "shopify-api-node";
import neatCsv from "neat-csv";
import consoleColor from "../../helpers/consoleColor.js";

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

const fileLocation = "./data/1jerrygee.csv";

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
  let endNum = csvArr.length;

  for (let i = startNum; i < endNum; i++) {
    // console.log(`Row #${i}`, csvArr[i]);

    const row = csvArr[i];
    const { subscription_id, customer_email, product_title } = row;
    const newProductId = +row["NEW Product ID"];
    const newProductTitle = row["NEW Product Title"];
    const newQty = +row["NEW Quantity"];
    const newPrice = +row["NEW price"].replace("$", "");

    // console.log({ newProductId, newQty, newPrice, subscription_id });

    global.removeSubscription = true;

    if (newProductId) {
      try {
        try {
          const product = await shopify.product.get(newProductId);
          const { variants } = product;
          const variantId = variants[0].id;
          global.variantId = variantId;
        } catch (error) {
          const products = await shopify.product.list({
            title: newProductTitle,
          });
          if (products.length > 1) {
            console.log(products);
          }
          const { variants } = products[0];
          const variantId = variants[0].id;
          global.variantId = variantId;
        }

        // console.log(product.id);
        console.log(global.variantId);

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

        const newSubscription = await recharge.subscription.create({
          address_id: +address_id,
          charge_interval_frequency,
          next_charge_scheduled_at,
          order_interval_frequency,
          order_interval_unit,
          quantity: newQty,
          shopify_variant_id: variantId,
          price: newPrice,
        });

        // console.log(newSubscription);
        consoleColor(newSubscription.id, "===== Subscription Created ======");
        consoleColor(
          newSubscription.id,
          `${customer_email} ${newSubscription.product_title}`
        );
        sleep();
      } catch (error) {
        console.log(`===============================`);
        console.log("======== Add Subscription ==========");
        console.log(`Row #${i}`, customer_email);
        console.log(error);
        console.log(`===============================`);
        global.removeSubscription = false;
      }
    }

    if (global.removeSubscription) {
      try {
        const result = await recharge.subscription.delete(subscription_id);
        consoleColor(subscription_id, "===== Subscription Deleted ======");
        consoleColor(subscription_id, `${customer_email} ${product_title}`);
      } catch (error) {
        console.log(`===============================`);
        console.log("======== Remove Subscription ==========");
        console.log(`Row #${i}`, customer_email);
        console.log(error);
        console.log(`===============================`);
      }
    }

    console.log(`\n`);
  }
};

main();
