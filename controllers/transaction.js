/*
 	NOTE:
	Transactions should be active until marked "done" in status.
	Only one 'in progress' transaction should occur
	When that transaction is completed, it's status will be updated to "done"

	We should have mutiple routes:
	1.) GET, /transactions/get, Fetch database for 'in progress', 'done', the UI for this needs to appear on all pages that allows users to add items
	2.) POST, /transactions/checkout, Updates the database, and completes the fields of the object for transaction
*/
const db = require('../utils/db');
const Customers = require('../models/Soap');
const DropOffs = require('../models/Drop-off');
const Soap = require('../models/Soap');
const Transactions = require('../models/Transactions');

/*
	POST /transaction/cart/add
	Add an item to cart
*/
exports.postAddToCart = (req, res) => {
	// We will use an JSON-based AJAX request here, this way the JSON being sent to the server can tell us what to type of item it is, and we can carry on the server side processing from there.
	const json = req.body;

	// Prepare json_response
	const json_response = {};

	// Check to make sure the data is in the json, and that the msg_type is "server_request"
	if("data" in json && json["msg_type"] == "server_request") {
		// Set data as variable
		const data = json["data"];

		// Check for item_type and id
		if("item_type" in json && "id" in data) {
			/*
				NOTE:
				There will be an id sent each time through the ajax call, we need checks for each type of item our store uses
			*/

			/*
				SOAP
			*/
			if(json["item_type"] == "soap") {
				const soapId = data["id"];
				let soap_data;

				// Find the soap
				return db.findById('Soap', soapId)
				.then(resp => {
					soap_data = resp.doc;

					// Now that we have found the soap, we need to look for a transaction to add this to, since there is can only be one 'in progress' transaction, we should query out database for such
					const query = {
						"status": "in progress"
					};
					return db.search('Transactions', query)
				})
				.then(resp => {
					const num_found = resp.metadata.found;

					// Check if there is any 'in progress' transaction
					if(num_found == 1) {
						console.log("EXISTING TRANSACTION FOUND");
						const current_transaction = resp.docs[0];

						// Add Soap to transaction
						const sales = current_transaction.sales;
						sales.push(soap_data);

						// Update the transaction
						const transaction_id = current_transaction._id;

						// Update database
						return db.updateById('Transactions', transaction_id, current_transaction)
						.then(resp => {

							// Now that the item has been added, we should send a success message to the client-side
							json_response["request_status"] = "success";
							return res.json( json_response );
						})
					}

					// Otherwise, create a transaction
					else {
						console.log("NO TRANSACTION FOUND, TRANSACTION CREATED");
						const new_transaction = {};

						// Update status to 'in progress'
						new_transaction["status"] = "in progress";

						// Update the database
						return db.createDoc('Transactions', new_transaction)
						.then(resp => {
							const current_transaction = resp.doc;
							const transaction_id = current_transaction._id;

							// Add Soap to this transaction
							const sales = current_transaction.sales;
							sales.push( soap_data );

							// Update the database
							return db.updateById('Transactions', transaction_id, current_transaction)
							.then(resp => {

								// Now that the item has been added, and a new transaction has been created, we should send a success message to the client-side
								json_response["request_status"] = "success";
								return res.json( json_response );
							})
						})
					}
				})
				.catch(err => {
					console.log(err);

					json_response["request_status"] = "error";
					return res.json( json_response );
				})
			}

		}
	}
}

/*
	GET /transaction/cart/get
	Gets items in cart
*/
exports.getCurrentTransaction = (req, res) => {
	// This will return an json item to the client-side, and the ajax there will fill in the cart ui
	const json_response = {};
	json_response["msg_type"] = "server_response";

	// Look up the transactions we have that is 'in progress';
	const query = {
		"status": "in progress"
	};
	return db.search('Transactions', query)
	.then(resp => {
		const num_found = resp.metadata.found;

		// Check if there is any 'in progress' transaction
		if(num_found == 1) {
			console.log("EXISTING TRANSACTION FOUND");
			const current_transaction = resp.docs[0];

			// We want to send back the sales field of the transaction
			const sales = current_transaction.sales;

			// Loop through each and add it to our json response message
			json_response["data"] = [];
			for(let i=0; i<sales.length; i++) {

				json_response["data"].push( sales[i] );
			}

			json_response["request_status"] = "success";
			// Send the json response to the client
			return res.json( json_response );
		}
		// Otherwise, we send the data to be fill into the client ui like "Cart is Empty.";
		else {
			json_response["request_status"] = "error";
			json_response["data"] = "Cart is Empty";
			return res.json( json_response );
		}
	})

};

exports.postCheckoutTransaction = (req, res) => {

};
