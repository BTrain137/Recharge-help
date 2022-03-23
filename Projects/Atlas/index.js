import dotenv from "dotenv";
import Recharge from "recharge-api-node";
import { deleteOneSubscription } from "./controller.js";

dotenv.config();

const { RECHARGE_API_KEY, RECHARGE_API_SECRETE } = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_API_SECRETE,
});

const main = async () => {
  const result = await deleteOneSubscription(00000000, recharge);
  console.log(result);
};

main();
