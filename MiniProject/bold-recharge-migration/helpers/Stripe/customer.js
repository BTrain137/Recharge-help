const restApiRequest = require("../apiRequest");
const { STRIPE_AUTH } = process.env;

module.exports.findCustomerByEmail = async (email) => {
  try {
    const options = {
      url: `https://api.stripe.com/v1/customers?email=${email}`,
      headers: {
        Authorization: `Bearer ${STRIPE_AUTH}`,
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
