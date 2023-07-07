const restApiRequest = require("../apiRequest");
const { RECHARGE_ACCESS_TOKEN } = process.env;

module.exports.getCustomerByEmail = async (email) => {
  try {
    const options = {
      url: `https://api.rechargeapps.com/customers?email=${email}`,
      headers: {
        "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      method: "GET",
      json: true,
    };

    const results = await restApiRequest(options);
    return results;
  } catch (error) {
    throw error;
  }
};
