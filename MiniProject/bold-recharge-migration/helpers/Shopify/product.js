const buildRestBody = require("../buildRestBody");
const buildAxiosQuery = require("../buildAxiosQuery");

/**
 * Get all the product detail by id, including metafields
 *
 * @param  {String|Number} id The id of the product
 * @param  {boolean}       isIncludeMetafield  Include metafields of the product. Takes longer
 * @return {Object}        The an object with key of product
 */

module.exports.getProductDetails = (id, isIncludeMetafield) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { product } = await buildRestBody(
        `/admin/products/${id}.json`,
        "GET"
      );
      if (!isIncludeMetafield) {
        resolve({ product });
      } else {
        const { metafields } = await buildRestBody(
          `/admin/products/${id}/metafields.json`,
          "GET"
        );
        const completeProduct = { product: { ...product, metafields } };
        resolve(completeProduct);
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports.searchProductByTitleGraph = async function (title) {
  try {
    const query = `
        query mensBasicTeeByTitle($num: Int!, $query: String!) {
          products(first: $num, query: $query) {
            edges {
              node {
                id
                handle
                title
                vendor
                tags
              }
            }
          }
        }
      `;
    const variables = {
      num: 50,
      query: `title:${title}`,
    };

    const result = await buildAxiosQuery(query, variables);

    return result;
  } catch (error) {
    throw error;
  }
};
