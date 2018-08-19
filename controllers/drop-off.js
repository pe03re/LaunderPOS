const db = require('../utils/db');
const DropOffs = require('../models/Drop-off');
const Customers = require('../models/Customers');

/*
	GET /overview/dropoff
	Get page for Dropoff
*/
exports.getDropOffForm = (req, res) => {
	return res.render('drop-off/overview_dropoff', {
		title: 'Drop-off',
	})
};

/*
	POST /dropoff/update/status
	When a user checkouts out a on "hold" dropoff, we are going to update the dropoff's status to "paid" so that the dropoff will be present in cart
*/
exports.postUpdateDropoffStatus = (req, res) => {

	let dropoff_data;

	const json = req.body;
	const json_response = {};
	json_response["msg_type"] = "server_response";

	if("msg_type" in json && json["msg_type"] == "server_request") {
		if("id" in json) {

			// We want to first update the status of the dropoff, then we need to search if there is a transaction in place, if there is not we will have to create one
			const dropOff_id = json["id"];

			const update_query = {
				"status": "paid"
			};
			return db.updateById('DropOffs', dropOff_id, update_query)
			.then(resp => {
				dropoff_data = resp.doc;

				return db.search("Transactions", { "status": "in progress"});
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
					if(dropoff_data["status"] == "paid") {
						sales.push(dropoff_data);
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
						if(dropoff_data["status"] == "paid") {
							sales.push(dropoff_data);
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
				json_response["status_msg"] = "Server error";
				return res.json( json_response )
			})
		}
 	}
}
