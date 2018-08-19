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

		// Check for item_type and id
		if("item_type" in json) {
			/*
				NOTE:
				There will be an id sent each time through the ajax call, we need checks for each type of item our store uses
			*/

			/*
				SOAP
			*/
			if(json["item_type"] == "soap" && "id" in json["data"]) {

				const data = json["data"];
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
							json_response["status"] = "success";
							return res.json( json_response );
						})
					}

					// Otherwise, create a transaction
					else {
						console.log("NO TRANSACTION FOUND, TRANSACTION CREATED");
						const new_transaction = {};

						// Update status to 'in progress'
						new_transaction["status"] = "in progress";

						// Add date to transaction
						new_transaction["date"] = new Date();

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
								json_response["status"] = "success";
								return res.json( json_response );
							})
						})
					}
				})
				.catch(err => {
					console.log(err);

					json_response["status"] = "error";
					return res.json( json_response );
				})
			};

			/*
				DROP-OFF

				For items that are dropoffs, it will be a bit more complicated than for adding a soap.

				1.) We need to add it to the 'DropOffs' collection, and if the customer is not in our database, we need to add the object to 'Customers' as well.
				2.) After updating our database, we will also need to add it to the our current 'in progress' transaction too
			*/
			if(json["item_type"] == "dropoff") {

				const new_dropoff_data = json["data"];
				let dropOff_data;
				let dropOff_id;

				// Create the dropoff
				return db.createDoc('DropOffs', new_dropoff_data)
				.then(resp => {
					dropOff_data = resp.doc;
					dropOff_id = dropOff_data._id;

					// We want to update the dropoff with its ticket_number (starting at 1), and then search for if the customer's number exists in our database
					const promise_array = Promise.all([
						db.search('DropOffs', {}),
						db.search('Customers', {})
					]);

					return promise_array;
				})
				.then(resp => {
					const allDropOffs = resp[0].docs;
					const allCustomers = resp[1].docs;

					// Tally the number of dropoffs in our system as the ticket number, and add it to an update object to update our dropoff
					dropOff_ticket_num = allDropOffs.length;

					const dropOff_ticket_update = {
						ticket_number: dropOff_ticket_num
					};

					let anyNewCustomer = true; // Boolean to check if there is a match in customers, true by default to create our first customer

					// Loop through all customers
					if(allCustomers.length > 0) {
						for(let i=0; i<allCustomers.length; i++) {
							if(allCustomers[i].phone == dropOff_data.customer_phone) {
								anyNewCustomer = false;
							} else {
								anyNewCustomer = true;
							}
						}
					};

					// If there is no match, we are going to update and add this to our Customers collection
					const newCustomer = {
						firstName: dropOff_data.customer_firstName,
						lastName: dropOff_data.customer_lastName,
						address: {
							street: dropOff_data.customer_address.street,
							city: dropOff_data.customer_address.city,
							state: dropOff_data.customer_address.state,
							zip: dropOff_data.customer_address.zip
						},
						email: dropOff_data.customer_email,
						phone: dropOff_data.customer_phone,
						date_registered: dropOff_data.date,
					}

					let create_customer_promise = undefined // Variable containing the function for creating a doc in our database

					if(anyNewCustomer == true) {
						create_customer_promise = db.createDoc('Customers', newCustomer);
					};

					// Finally we are going to perform database functions
					const promise_array = Promise.all ([
						db.updateById('DropOffs', dropOff_id, dropOff_ticket_update),
						create_customer_promise
					]);

					return promise_array;
				})
				.then(resp => {
					// Now that we have finished dealing with the logic behind dropoffs, we need to look for a transaction to add this to, since there is can only be one 'in progress' transaction, we should query out database for such
					const query = {
						"status": "in progress"
					};
					return db.search('Transactions', query)
				})
				.then(resp => {
					const num_found = resp.metadata.found;

					// Check if there is any 'in progress' transaction
					if(num_found == 1) {
						console.log("EXISTING TRANSACTION IN PROGRESS FOUND");
						const current_transaction = resp.docs[0];

						// Add Dropff to transaction
						const sales = current_transaction.sales;

						// Check for the status of the dropoff, if the dropoff is "hold" we dont add it to the transaction, if it is "paid" then we add it to the transaction
						if(dropOff_data["status"] == "paid") {
							sales.push(dropOff_data);
						};

						// Update the transaction
						const transaction_id = current_transaction._id;

						// Update database
						return db.updateById('Transactions', transaction_id, current_transaction)
						.then(resp => {

							// Now that the item has been added, we should send a success message to the client-side
							json_response["status"] = "success";
							return res.json( json_response );
						})
					}

					// Otherwise, create a transaction
					else {
						console.log("NO TRANSACTION IN PROGRESS FOUND, TRANSACTION CREATED");
						const new_transaction = {};

						// Update status to 'in progress'
						new_transaction["status"] = "in progress";

						// Add date to transaction
						new_transaction["date"] = new Date();

						// Update the database
						return db.createDoc('Transactions', new_transaction)
						.then(resp => {
							const current_transaction = resp.doc;
							const transaction_id = current_transaction._id;

							// Add Dropoff to this transaction
							const sales = current_transaction.sales;

							// Check for the status of the dropoff, if the dropoff is "hold" we dont add it to the transaction, if it is "paid" then we add it to the transaction
							if(dropOff_data["status"] == "paid") {
								sales.push(dropOff_data);
							};

							// Update the database
							return db.updateById('Transactions', transaction_id, current_transaction)
							.then(resp => {

								// Now that the item has been added, and a new transaction has been created, we should send a success message to the client-side
								json_response["status"] = "success";
								return res.json( json_response );
							})
						})
					}
				})
				.catch(err => {
					console.log(err);

					json_response["status"] = "error";
					json_response["status_msg"] = "Error in server";
					return res.json( json_response );
				});
			};
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
			console.log("EXISTING TRANSACTION IN PROGRESS FOUND");
			const current_transaction = resp.docs[0];
			const transaction_id = current_transaction._id;

			// We want to send back the sales field of the transaction
			const sales = current_transaction.sales;

			// Loop through each and add it to our json response message
			json_response["data"] = [];
			for(let i=0; i<sales.length; i++) {

				json_response["data"].push( sales[i] );
			}

			json_response["status"] = "success";

			// Add the id to the JSON response
			json_response["transaction_id"] = transaction_id;

			// Send the json response to the client
			return res.json( json_response );
		}
		// Otherwise, we send the data to be fill into the client ui like "Cart is Empty.";
		else {
			json_response["status"] = "error";
			json_response["data"] = "Cart is Empty";
			return res.json( json_response );
		}
	})

};

/*
	POST /transaction/cart/clear
	Clears all items from cart
*/
exports.postClearTransaction = (req, res) => {

	const json = req.body;

	const json_response = {};
	json_response["msg_type"] = "server_response";

	if("data" in json && json["msg_type"] == "server_request") {

		console.log("GOT REQUEST");

		const transaction_id = json["data"];

		return db.removeById("Transactions", transaction_id)
		.then(resp => {

			json_response["status"] = "success";
			return res.json( json_response );
		})
		.catch(err => {

			json_response["status"] = "error";
			json_response["status_msg"] = "Error in Server";
			return res.json( json_response );
		})
	}
}

/*
	POST /transaction/cart/checkout
	Checks out the data, and stores it in our history.
*/
exports.postCheckoutTransaction = (req, res) => {

	const json = req.body;
	const json_response = {};
	json_response["msg_type"] = "server_response";

	// We are looking for a ajax post call, and an id in the json for us to find in our database
	if("msg_type" in json && json["msg_type"] == "server_request") {
		if("id" in json) {
			const transactionId = json["id"];

			// Because we can only have 1 "in progress" transaction, we have to change the current transaction status to done. Transactions that do not have the status "in progress" will be be cleared from the cart.
			const query = { "status": "done" };
			return db.updateById("Transactions", transactionId, query)
			.then(resp => {
				
				json_response["status"] = "success";
				return res.json( json_response );
			})
			.catch(err => {

				console.log(err);
				json_response["status"] = "error";
				return res.json( json_response );
			})
		}
	}

};
