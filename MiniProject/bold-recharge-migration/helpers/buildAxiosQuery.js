const axiosRequest = require("./axiosRequest.js");
const { ACCESS_TOKEN, SHOP, SHOP_VERSION } = process.env;

/**
 * Post request to shopify
 *
 * @param   {String}  query     Request body
 * @param   {Object}  variables GraphQl query variables
 *  @param   {Number}  delay     Amount of time in milliseconds before resolving
 * @returns {Promise}           Promise object represents the post body
 */

const buildAxiosQuery = function (query, variables, delay) {
  return new Promise(async function (resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/${SHOP_VERSION}/graphql.json`,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ACCESS_TOKEN,
        },
        method: "POST",
        data: {
          query: query,
          variables: variables,
        },
      };
      const result = await axiosRequest(options, delay);

      const {
        extensions: { cost },
      } = result;

      const {
        throttleStatus: { currentlyAvailable },
      } = cost;

      if (currentlyAvailable < 1000) {
        console.log("currentlyAvailable: ", currentlyAvailable);
        setTimeout(() => {
          resolve(result);
        }, 2000);
      } else {
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = buildAxiosQuery;
