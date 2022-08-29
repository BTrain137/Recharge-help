fetch("/cart.js").then(data => data.json()).then(extractToRecharge).then(console.log);



function extractToRecharge(cart) {

  const rechargeItems = cart.items.map((item) => {
    const { properties } = item

    return {
      "charge_interval_frequency": "30",
      "next_charge_scheduled_at": "2022-12-09",
      "order_interval_frequency": "30",
      "order_interval_unit": "day",

      quantity: item.quantity,
      "shopify_variant_id": item.variant_id,

      "properties[_bundle]": properties["_bundle"],
      "properties[_bundle_id]":  properties["_bundle_id"],
      "properties[_bundle_item_index]": properties["_bundle_item_index"],
      "properties[_bundle_price]": properties["_bundle_price"],
      "properties[_bundle_item_titles]": properties["_bundle_item_titles"],
      "properties[_bundle_img]": properties["_bundle_img"],
    }
  });

  const dataToSend = {
    subscriptions: rechargeItems
  }

  console.log(JSON.stringify({dataToSend}));

  return dataToSend;
}
