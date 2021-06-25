const dotenv = require("dotenv");
const Recharge = require("recharge-api-node");
const findAndDeleteSubscription = require("./controller");

// dotenv.config({ path: "./.env.vive-organic" });
dotenv.config({ path: "./.env.primal-blueprint" });
// dotenv.config({ path: "./.env.primal-kitchen" });

const variantId = 14176309084221;

const { RECHARGE_API_KEY, RECHARGE_API_SECRETE } = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_API_SECRETE,
});

// TODO: Replace with another product
// TODO: Give discount on the replaced product

findAndDeleteSubscription(variantId, recharge, true)
  .then((customers) => {
    console.log(JSON.stringify(customers));
    if (Array.isArray(customers)) {
      customers.forEach((customer) => console.log(customer.email));
    }
  })
  .catch((error) => console.log(error));
