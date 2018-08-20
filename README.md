# LaunderPOS
Web based POS built specifically for laundromats, and to test my familiarity with Node.js, building a JSON based API, and a project for me to use software to help businesses.

### Why a specific POS just for laundromats?
Alot of POS systems currently are built catering to businesses that require just adding items, and checking out. However, for laundromats, the business revolves around not just detergents, but drop-offs as well. Drop-offs require much more than just adding an item to the checkout cart.

### Technologies Used
```
Node.js
MongoDB
```

### JSON API
This application uses a JSON based API, where the client will send a **json_request** object to the server, and the server will then respond to the request with a **json_response** object. Given that the client is built with Handlebars.js, the requests to the server are made with AJAX.

### TODO:
- Add support for Barcode Readers
- Add support for Thermal Receipt Printers
