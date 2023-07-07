require("dotenv").config();
const fs = require("fs");
const neatCsv = require("neat-csv");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const { getProductDetails } = require("./helpers/Shopify/product");
const { getCustomerByEmail } = require("./helpers/Recharge/customer");
const { findCustomerByEmail } = require("./helpers/Stripe/customer");

const createCSV = (csvFile, fileName) => {
  const csvWriter = createCsvWriter({
    path: fileName,
    header: [
      { id: "external_product_name", title: "external_product_name" },
      { id: "external_variant_name", title: "external_variant_name" },
      { id: "external_product_id", title: "external_product_id" },
      { id: "external_variant_id", title: "external_variant_id" },
      { id: "quantity", title: "quantity" },
      { id: "recurring_price", title: "recurring_price" },
      // Recurring properties
      { id: "charge_interval_unit_type", title: "charge_interval_unit_type" },
      { id: "charge_interval_frequency", title: "charge_interval_frequency" },
      {
        id: "shipping_interval_unit_type",
        title: "shipping_interval_unit_type",
      },
      {
        id: "shipping_interval_frequency",
        title: "shipping_interval_frequency",
      },
      // Dates
      { id: "charge_on_day_of_month", title: "charge_on_day_of_month" },
      { id: "last_charge_date", title: "last_charge_date" },
      { id: "next_charge_date", title: "next_charge_date" },
      // Customer Info
      { id: "customer_stripe_id", title: "customer_stripe_id" },
      { id: "customer_created_at", title: "customer_created_at" },
      // Shipping
      { id: "shipping_email", title: "shipping_email" },
      { id: "shipping_first_name", title: "shipping_first_name" },
      { id: "shipping_last_name", title: "shipping_last_name" },
      { id: "shipping_phone", title: "shipping_phone" },
      { id: "shipping_address_1", title: "shipping_address_1" },
      { id: "shipping_address_2", title: "shipping_address_2" },
      { id: "shipping_city", title: "shipping_city" },
      { id: "shipping_province", title: "shipping_province" },
      { id: "shipping_zip", title: "shipping_zip" },
      { id: "shipping_country", title: "shipping_country" },
      { id: "shipping_company", title: "shipping_company" },
      // Billing
      { id: "billing_first_name", title: "billing_first_name" },
      { id: "billing_last_name", title: "billing_last_name" },
      { id: "billing_address_1", title: "billing_address_1" },
      { id: "billing_address_2", title: "billing_address_2" },
      { id: "billing_city", title: "billing_city" },
      { id: "billing_postalcode", title: "billing_postalcode" },
      { id: "billing_province_state", title: "billing_province_state" },
      { id: "billing_country", title: "billing_country" },
      { id: "billing_phone", title: "billing_phone" },
      // Status
      { id: "status", title: "status" },
    ],
  });

  csvWriter
    .writeRecords(csvFile)
    .then(() => console.log("The CSV file was written successfully", fileName));
};

const matchUpRechargeAndBold = (
  row,
  productId,
  variantId,
  qty,
  price,
  customerStripeId
) => {
  return {
    // Products
    external_product_id: productId,
    external_variant_id: variantId,

    //
    quantity: qty,
    recurring_price: price,

    // Recurring Properties
    charge_interval_unit_type: row["Interval Type"],
    charge_interval_frequency: row["Interval Number"],
    shipping_interval_unit_type: row["Interval Type"],
    shipping_interval_frequency: row["Interval Number"],
    // Dates
    charge_on_day_of_month: row[""],
    last_charge_date: row[""], // (only for prepaid subscriptions)
    next_charge_date: row["Next Order Date"],
    // Customer Info
    customer_stripe_id: customerStripeId,
    customer_created_at: row[""],
    // Shipping
    shipping_email: row["Customer E-mail"],
    shipping_first_name: row["Shipping First Name"],
    shipping_last_name: row["Shipping Last Name"],
    shipping_phone: row["Shipping Phone"],
    shipping_address_1: row["Shipping Address 1"],
    shipping_address_2: row["Shipping Address 2"],
    shipping_city: row["Shipping City"],
    shipping_province: row["Shipping Province"],
    shipping_zip: row["Shipping Zip"],
    shipping_country: row["Shipping Country"],
    // Billing
    billing_first_name: row["Billing First Name"],
    billing_last_name: row["Billing Last Name"],
    billing_phone: row["Billing Phone"],
    billing_address_1: row["Billing Address 1"],
    billing_address_2: row["Billing Address 2"],
    billing_city: row["Billing City"],
    billing_province_state: row["Billing Province"],
    billing_postalcode: row["Billing Zip"],
    billing_country: row["Billing Country"],
    // Status
  };
};

const processRowDate = async (
  rowData,
  paymentProcessor,
  isCheckRechargeCustomer
) => {
  const productTitles = rowData["Products"].split(",");
  const productIds = rowData["Product ID"].split(",");
  const variantIds = rowData["Variant ID"].split(",");
  const customerEmail = rowData["Customer E-mail"];
  const billingFirstName = rowData["Billing First Name"];

  const active = rowData["Active"];
  const isPaused = rowData["Is Paused"];
  let customerStripeId;

  const result = [];

  if (active === "No" || isPaused === "1") {
    return result;
  }

  // TODO: This should be an option
  if (rowData["Last Transaction Failure Date"]) {
    console.log(`${rowData["Last Transaction Failure Date"]}`);
    console.log(`Last Order Date: ${rowData["Last Order Date"]}`);
    console.log(
      `Last Transaction Failure Type: ${rowData["Last Transaction Failure Type"]}`
    );
    console.log(
      `Last Transaction Failure Code: ${rowData["Last Transaction Failure Code"]}`
    );
    console.log(
      `Last Transaction Failure Message: ${rowData["Last Transaction Failure Message"]}`
    );
    console.log(
      `Last Transaction Failure Date: ${rowData["Last Transaction Failure Date"]}`
    );
    console.log(`Next Order Date: ${rowData["Next Order Date"]}`);
    console.log(`Is Paused: ${rowData["Is Paused"]}`);
    console.log(customerEmail);

    const d = new Date();
    d.setMonth(d.getMonth() - 4);

    const lastTransFailDate = new Date(
      rowData["Last Transaction Failure Date"]
    );

    if (lastTransFailDate < d) {
      console.log("skipped older than 4 months");
      return result;
    }
  }

  if (isCheckRechargeCustomer) {
    const rechargeCustomer = await getCustomerByEmail(customerEmail);
    if (rechargeCustomer.customers.length) {
      console.log("---------Customer Found--------");
      console.log(`Next Order Date: ${rowData["Next Order Date"]}`);
      console.log(customerEmail);
      return result;
    }
  }

  if (paymentProcessor === "STRIPE") {
    const stripeResult = await findCustomerByEmail(customerEmail);
    const { data: stripeData } = stripeResult;
    const stripeCustomerName = stripeData[0].sources.data[0].name;
    if (!stripeCustomerName.includes(billingFirstName)) {
      throw "Name Does Not Match!!!!!!!!";
    }
    // stripeResult.data[0].sources.data[0].name
    customerStripeId = stripeData[0].id;
  }

  for (let index = 0; index < productIds.length; index++) {
    const product_id = productIds[index].trim();
    const variant_id = variantIds[index].trim();

    try {
      let product = {};
      try {
        const result = await getProductDetails(product_id);
        product = result.product;
      } catch (error) {
        if (error.errors === "Not Found") {
          continue;
        } else {
          console.log(error);
        }
      }
      const [productTitle] = productTitles.filter((title) =>
        title.includes(product.title)
      );

      if (!productTitle) {
        console.log(productTitle);
        console.log(product.title);
        console.log(customerEmail);
        console.log("No title");
      }

      const [title, splitter, priceAndQty] = productTitle.split(
        /(\s-\s)(?!.*\1)/
      );

      // Figure out which one is the correct title to get the quantity.
      const [price, qty] = priceAndQty.split(" x ");
      if (qty == 0) {
        if (productIds.length === 1) {
          console.log(customerEmail);
          console.log("qty none");
        }
        continue;
      }

      const cleanedRow = matchUpRechargeAndBold(
        rowData,
        product_id.trim(),
        variant_id.trim(),
        qty,
        price,
        customerStripeId
      );
      result.push(cleanedRow);
    } catch (error) {
      console.log(customerEmail);
      console.log(
        `Last Transaction Failure Message: ${rowData["Last Transaction Failure Message"]}`
      );
      console.log(error);
    }
  }

  return result;
};

const boldFile = "recurring_orders_all_customer_export_2021-04-05.csv";
const isCheckRechargeCustomer = false;
const paymentProcessor = "Stripe";

fs.readFile(`./bold-export/${boldFile}`, async (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const csvArr = await neatCsv(data);

  const largeArray = [];

  let x = 0;

  for (x; x < csvArr.length; x++) {
    const row = csvArr[x];
    const results = await processRowDate(
      row,
      paymentProcessor.toLocaleUpperCase(),
      isCheckRechargeCustomer
    );
    for (let i = 0; i < results.length; i++) {
      largeArray.push(results[i]);
    }
    console.log(`Row# ${x}`);
  }

  createCSV(largeArray, `./recharge-results/customers_2021-04-05.csv`);

  // TODO: Dynamically split large Array
  // const biggerArr = [
  //   largeArray.slice(0, 500),
  //   largeArray.slice(501, 1000),
  //   largeArray.slice(1001, 1500),
  //   largeArray.slice(1501),
  // ];

  // for (let x = 0; x < biggerArr.length; x++) {
  //   const element = biggerArr[x];
  //   createCSV(element, `./recharge-results/customers-${x}.csv`);
  // }
});
