const axios = require("axios").default;
require("dotenv").config();

const { RECHARGE_TOKEN } = process.env;

const rechargeGetCustomer = async (email) => {
  try {
    const result = await axios.get(
      `https://api.rechargeapps.com/customers?email=${email}`,
      {
        headers: {
          "X-Recharge-Version": "2021-11",
          "Content-Type": "application/json",
          "X-Recharge-Access-Token": RECHARGE_TOKEN,
        },
      }
    );
    const { customers } = result.data;
    // Email is a unique ID, there should only be one
    // Possible race condition for recharge and BistroMD
    return customers[0];
  } catch (error) {
    throw error;
  }
};

const rechargeGetSubscription = async (customerId) => {
  try {
    const result = await axios.get(
      `https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`,
      {
        headers: {
          "X-Recharge-Version": "2021-11",
          "Content-Type": "application/json",
          "X-Recharge-Access-Token": RECHARGE_TOKEN,
        },
      }
    );
    const { subscriptions } = result.data;
    // A customer should only have one active meal plan at a time
    const subscription = subscriptions.find(
      ({ status }) => status === "active"
    );
    return subscription;
  } catch (error) {
    throw error;
  }
};

const rechargeSetNextCharge = async (subscriptionId, date) => {
  try {
    const result = await axios({
      method: "PUT",
      url: `https://api.rechargeapps.com/subscriptions/${subscriptionId}`,
      headers: {
        "X-Recharge-Version": "2021-11",
        "Content-Type": "application/json",
        "X-Recharge-Access-Token": RECHARGE_TOKEN,
      },
      data: {
        next_charge_scheduled_at: date,
      },
    });
    const { subscription } = result.data;
    return subscription;
  } catch (error) {
    throw error;
  }
};

const main = async (email, date) => {
  try {
    const customer = await rechargeGetCustomer(email);
    const subscription = await rechargeGetSubscription(customer.id);
    // The charge date is the next warehouse day
    const result = await rechargeSetNextCharge(subscription.id, date);
    console.log(JSON.stringify(result));
  } catch (error) {
    console.log("Error: ", error);
  }
};

main("bryan89tran@yahoo.com", "2022-09-08");
