import { readFile, appendFile } from "fs/promises";
import * as fs from 'fs';
import dotenv from "dotenv";
import Recharge from "recharge-api-node";
import Shopify from "shopify-api-node";
import neatCsv from "neat-csv";
import consoleColor from "../../helpers/consoleColor.js";

const instanceNum = 4;

dotenv.config();

const RECHARGE_API_KEY = process.env[`RECHARGE_API_KEY-${instanceNum}`];
const RECHARGE_API_SECRETE = process.env[`RECHARGE_API_SECRETE-${instanceNum}`];
const SHOPIFY_SHOP = process.env[`SHOPIFY_SHOP-${instanceNum}`];
const SHOPIFY_API_KEY = process.env[`SHOPIFY_API_KEY-${instanceNum}`];
const SHOPIFY_PASSWORD = process.env[`SHOPIFY_PASSWORD-${instanceNum}`];


const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_API_SECRETE,
});

const shopify = new Shopify({
  shopName: SHOPIFY_SHOP,
  apiKey: SHOPIFY_API_KEY,
  password: SHOPIFY_PASSWORD,
});

const fileLocation =
  `./data-${instanceNum}/New_Website_Updated_Subs_31822_BLANK_CXLD-${instanceNum}.csv`;

const sleep = (timeInSeconds = 50) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeInSeconds);
  });
};

const pad = (n) => {
  return n < 10 ? "0" + n : n;
};

const test_data_match = async () => {
  const data = await readFile(
    new URL(
      "./data/test_data/TEST_New_Website_Updated Subs_31822_BLANK CXLD.csv",
      import.meta.url
    )
  );
  const csvArr = await neatCsv(data);
  const test_customer = csvArr.reduce((acc, row) => {
    if (!acc[row.customer_email]) {
      acc[row.customer_email] = 1;
    }
    return acc;
  }, {});
  return test_customer;
};

const approvedVarID = [
  39543463510118, 39543255335014, 39540055310438, 39540052164710,
  39540065468518,
];

const addNewSubscription = async (
  customer_email,
  row,
  addressId,
  subscription_id,
  newProductId,
  newProductTitle,
  newQty,
  newPrice,
  i
) => {
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
    // console.log(global.variantId);

    const subscription = await recharge.subscription.get(subscription_id);
    // console.log(subscription);

    const {
      address_id,
      charge_interval_frequency,
      next_charge_scheduled_at,
      order_interval_frequency,
      order_interval_unit,
      status,
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

    if (status === "CANCELLED") {
      consoleColor(subscription.id, "===== Canceled Since ======");
      consoleColor(
        subscription.id,
        `Row #${i} ${customer_email} ${subscription.product_title}`
      );
    } else {
      if (!next_charge_scheduled_at) {
        consoleColor(
          subscription.id,
          `Row #${i} ${customer_email} ${subscription.product_title}`
        );
        console.log(
          "next_charge_scheduled_at is Null ========================================================="
        );
      }
      const endOfWeekDate = new Date("2022-03-28T00:00:00");
      let nextChargeScheduledAt = new Date(next_charge_scheduled_at);
      if (endOfWeekDate > nextChargeScheduledAt) {
        nextChargeScheduledAt.setDate(nextChargeScheduledAt.getDate() + 7);
      }

      nextChargeScheduledAt = `${nextChargeScheduledAt.getFullYear()}-${pad(
        nextChargeScheduledAt.getMonth() + 1
      )}-${pad(nextChargeScheduledAt.getDate())}T00:00:00`;

      // console.log(nextChargeScheduledAt);

      const newSubscription = await recharge.subscription.create({
        address_id: +address_id,
        charge_interval_frequency,
        next_charge_scheduled_at: nextChargeScheduledAt,
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
        `Row #${i} ${customer_email} ${newSubscription.product_title}`
      );
    }
  } catch (error) {
    const subscriptions = await recharge.subscription.list({
      address_id: addressId,
    });
    if (subscriptions.length) {
      const [correctItem] = subscriptions.filter(
        (subscription) => subscription.shopify_variant_id == global.variantId
      );
      if (correctItem) {
        console.log("====================================");
        console.log("===========  Skip  ============");
        consoleColor(
          correctItem.id,
          `Row #${i} ${customer_email} ${correctItem.product_title}`
        );
        console.log("====================================");
        global.removeSubscription = false;
        return;
      }
    }
    else {
      return;
    }

    delete row["properties"];
    let csvRow = Object.values(row).join(",");
    csvRow += `,"${JSON.stringify(error.response.body.errors)}"`;
    csvRow += "\n";
    await appendFile(
      new URL(`./data-${instanceNum}/error_logs_create-${instanceNum}.csv`, import.meta.url),
      csvRow
    );

    console.log(`===============================`);
    console.log("======== Add Subscription ==========");
    console.log(`Row #${i}`, customer_email);
    console.log(error?.response?.body.errors);
    console.log(`++++++++++++++++`);
    console.log(error);
    console.log(`===============================`);
    global.removeSubscription = false;
  }
};

const main = async () => {
  const test_data = await test_data_match();
  const data = await readFile(new URL(fileLocation, import.meta.url));
  const csvArr = await neatCsv(data);
  let endNum = csvArr.length;
  let startNum = 0;

  for (let i = startNum; i < endNum; i++) {
    // console.log(`Row #${i}`, csvArr[i]);

    const row = csvArr[i];
    const { customer_email, product_title, address_id: addressId } = row;
    const subscription_id = row["﻿subscription_id"];
    const newProductId = +row["NEW Product ID"];
    const newProductTitle = row["NEW Product Title"];
    const newQty = +row["NEW Quantity"];
    const newPrice = +row["NEW price"].replace("$", "");

    if (test_data[customer_email]) {
      continue;
    }

    // console.log({ newProductId, newQty, newPrice, subscription_id });

    global.removeSubscription = true;

    if (newProductId) {
      await addNewSubscription(
        customer_email,
        row,
        addressId,
        subscription_id,
        newProductId,
        newProductTitle,
        newQty,
        newPrice,
        i
      );
    }

    if (global.removeSubscription) {
      try {
        const result = await recharge.subscription.delete(subscription_id);
        consoleColor(subscription_id, "===== Subscription Deleted ======");
        consoleColor(
          subscription_id,
          `Row #${i} ${customer_email} ${product_title}`
        );
      } catch (error) {
        const subscriptions = await recharge.subscription.list({
          address_id: addressId,
        });
        const [correctItem] = subscriptions.filter((subscription) =>
          approvedVarID.includes(subscription.shopify_variant_id)
        );
        if (correctItem) {
          console.log(`==============================`);
          console.log(`Row #${i}`, customer_email);
          console.log("Skip No Subscriptions Delete");
          console.log(`===============================`);
        } else {
          if (subscriptions.length) {
            delete row["properties"];
            let csvRow = Object.values(row).join(",");
            csvRow += `,"${JSON.stringify(
              error.response.body.error || error.response.body.errors
            )}"`;
            csvRow += "\n";
            appendFile(
              new URL(
                `./data-${instanceNum}/error_logs_delete-${instanceNum}.csv`,
                import.meta.url
              ),
              csvRow
            );

            console.log(`===============================`);
            console.log("======== Remove Subscription ==========");
            console.log(`Row #${i}`, customer_email);
            console.log(error);
            console.log(`===============================`);
          } else {
            console.log(`==============================`);
            console.log(`Row #${i}`, customer_email);
            console.log("No Subscriptions");
            console.log(`===============================`);
          }
        }
      }
    }

    console.log(`\n`);
    fs.writeFileSync(new URL(`./data-${instanceNum}/track-${instanceNum}.txt`, import.meta.url), i.toString())
  }

  console.log("Completed!!");
};

main();
// (async function test() {
// 	const result = await test_data_match();
//   console.log(result['24601pk@gmail.com']);
//   console.log(result['bryan89tran@yahoo.com']);
// })();
