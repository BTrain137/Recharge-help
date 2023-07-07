const axios = require("axios");
/**
 * Post request to shopify
 *
 * @param   {Object}  query Request body
 * @param   {Number}  delay Delay of request for rapid request
 * @returns {Promise}       Promise object represents the post body
 */

const postShopifyGraphQL = function (query, delay = 500) {
  return new Promise(function (resolve, reject) {
    axios(query)
      .then(({ data }) => {
        if (data.errors) {
          reject(data);
        } else {
          setTimeout(() => {
            resolve(data);
          }, delay);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports = postShopifyGraphQL;
