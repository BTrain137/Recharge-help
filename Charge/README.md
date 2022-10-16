# Capture Payment

- 1 Retrieve the charge id first. 
  - [retrieve-charge-by-shopify-order-id.http](./List-Charges/get-charge-by-shopify-order-id.http)
  - Charge ID's are special and *not* to be confused with subscription ID's or order ID's
  - The best method to get the charge id is the last method listed
    - *Get Charge by customer id and status is pending*
  - The status should be *PENDING*
- 2 Using the charge id then we can capture payment on the order 
  - [payment-capture.http](./Payment-Capture/payment-capture.http)
- 3 Test to see if the charge has gone through
  - [retrieve-charge-by-id.http](./Retrieve-Charge/retrieve-charge-by-id.http)
  - The first time retrieving the charge should be `"status": "PENDING",`
  - After payment is captured then the charge should be `"status": "SUCCESS",`

Note:
  - `"status": "QUEUE",` charges are orders that haven't been dropped into shopify yet. 
    - Usually the next up coming order (next up coming warehouse day)
