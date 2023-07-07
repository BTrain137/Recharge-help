const apiRequest = require("./apiRequest.js");
const { SHOP, ACCESS_TOKEN } = process.env;

/**
 * Building rest API end point
 * 
 * @param  {String} url    the url param of the end point
 * @param  {String} method HTTP method: GET, POST, PUT, DELETE
 * @param  {Object} body   The body if need to post data
 */

const buildRestBody = function(url, method, body) {
  return new Promise(async function(resolve, reject) {
    try {
      const params = {
        url: `https://${SHOP}.myshopify.com${url}`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json"
        },
        method: method,
        body: body,
        json: true
      };
      const result = await apiRequest(params);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = buildRestBody;
