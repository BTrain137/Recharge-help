# Capture Payment

- 1 Retrieve the charge id first. 
  - [retrieve-charge-by-shopify-order-id.http](./List-Charges/get-charge-by-shopify-order-id.http)
  - Charge ID's are special and *not* to be confused with subscription ID's or order ID's
- 2 Using the charge id then we can capture payment on the order 
  - [payment-capture.http](./Payment-Capture/payment-capture.http)
