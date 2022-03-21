let subscriptionId = 194387971;
let shopifyVariantId = 31387183415376;
let url = "https://www.verygoodbutchers.com/tools/recurring/portal/36ccdd3d3ba9dcb39598672a720ade/subscriptions/" + subscriptionId + '?token=' + window.customerToken;
let data = {
	"properties[_shopify_variant_id]": shopifyVariantId,
	"properties[_bundle_item_index]": '1',
	"properties[_bundle]": 'Build A Box Subscription',
	"properties[_bundle_id]": 1636315484810,
	"properties[_bundle_img]": 'https://cdn.shopify.com/s/files/1/1605/5587/collec…0d97-3aa1-4110-9a8f-402f6d9634ad.png?v=1636077229',
	"properties[_bundle_item_titles]": 'Very Good Dog, Smokin&#39; Burgers, BBQ Pulled Jackfruit, Pepperoni, Very Good Taco Stuff&#39;er, The Very Good Burger',
	"properties[_bundle_title]": 'Build A Box',
	"properties[_bundle_price]": 6621,
	"properties[charge_interval_frequency]": 30,
	"properties[shipping_interval_frequency]": 30,
	"properties[shipping_interval_unit_type]": 'day',
}
let options = {
	method: "post",
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify(data)
}

fetch(url, options)
	.then((response) => response.json())
	.then((showData) => {
		// Successful request made
		console.log(showData);
	})
	.catch((error) => {
		// Request failed
		console.error(error);
	});
