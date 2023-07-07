const request = require("request");

/**
 * Get request
 *
 * @param   {Object} option The request object for shopify
 * @returns {Promise}       Promise object represents the post body
 */

const apiRequest = function(option) {
  return new Promise(function(resolve, reject) {
    request(option, function(err, res, body) {
      if (err) {
        console.log("Request Error");
        reject(err);
      }
      if(res && res.statusCode >= 300) {
        console.log(res.statusMessage);
        reject(body);
      }
      if (body && body.hasOwnProperty("error")) {
        reject(body);
      }
      else {
        setTimeout(() => {
          resolve(body);
        }, 250);
      }
    });
  });
};

module.exports = apiRequest;
