export const deleteOneSubscription = (subscriptionId, recharge) => {
  return new Promise((resolve, reject) => {
    recharge.subscription
      .delete(subscriptionId)
      .then((result) => resolve(result))
      .catch((err) => reject(err));
  });
};

