const subscriptionList = (shopifyVarId) => {
  return new Promise((resolve, reject) => {
    global.recharge.subscription
      .list({
        shopify_variant_id: shopifyVarId,
      })
      .then((subscriptions) => resolve(subscriptions))
      .catch((err) => reject(err));
  });
};

// return {}
const deleteOneSubscription = (subscriptionId) => {
  return new Promise((resolve, reject) => {
    global.recharge.subscription
      .delete(subscriptionId)
      .then((result) => resolve(result))
      .catch((err) => reject(err));
  });
};

const deleteManySubscriptions = async (list) => {
  const customers = [];
  try {
    for (let i = 0; i < list.length; i++) {
      const { id, status, email, product_title } = list[i];
      const result = await deleteOneSubscription(id);
      console.log({ email, status, product_title });
      if (status !== "CANCELLED") {
        customers.push({ email, status, product_title });
      }
    }
    return customers;
  } catch (error) {
    throw error;
  }
};

// Find and delete all subscription by shopify variant Id
const findAndDeleteSubscription = async (shopifyVarId, recharge) => {
  global.recharge = recharge;
  try {
    const list = await subscriptionList(shopifyVarId);
    if (!list.length) {
      return `No Subscription Found for: ${shopifyVarId}`;
    }
    const customers = await deleteManySubscriptions(list);
    return customers;
  } catch (error) {
    throw error;
  }
};

module.exports = findAndDeleteSubscription;
