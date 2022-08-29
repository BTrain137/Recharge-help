// Shopify
// Add Products
fetch("/cart/add.js", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: ,
    quantity: 1,
  }),
})
  .then((data) => data.json())
  .then(console.log)
  .catch(console.log);

// Change
fetch("/cart/change.js", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "43007843762420:6007c5b627c63450aa86cb56aba60951",
    quantity: 1,
    selling_plan: 3154673908,
  }),
})
  .then((data) => data.json())
  .then(console.log)
  .catch(console.log);



// ReCharge on shopify

window.ReChargeWidget.api.fetchProducts().then(console.log);

ReChargeWidget.api.postToCart({ id: 43007843696884, sellingPlanId: 3156214004, sellingPlanGroupId: 947575, isSubscription: true })
  .then(console.log)
  .catch(console.log)
