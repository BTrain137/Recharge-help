const Recharge = require("recharge-api-node");
const findAndDeleteSubscription = require("./controller");

const recharge = new Recharge({
  apiKey: "",
  secrete: "",
});

findAndDeleteSubscription("", recharge, true)
  .then((customers) => {
    console.log(JSON.stringify(customers));
  })
  .catch((error) => console.log(error));
