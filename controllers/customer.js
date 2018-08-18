const db = require('../utils/db');
const Customers = require('../models/Soap');

/*
	GET /customers/all
	Get list of all customers
*/
exports.getCustomersList = (req, res) => {

	return db.search('Customers', {})
	.then(resp => {
		const customers_data = resp.docs;

		// Create a name property for all customers, and an address property for all customers
		if(customers_data.length > 0) {
			for(let i=0; i<customers_data.length; i++) {
				// Name
				customers_data[i].name = (customers_data[i].firstName + " " + customers_data[i].lastName);

				// Address
				let street = customers_data[i].address.street;
				let city = customers_data[i].address.city;
				let state = customers_data[i].address.state;
				let zip = customers_data[i].address.zip;

				customers_data[i].fullAddress = (street + " " + city + " " + state +  " " + zip);
			}
		}

		return res.render('customers/all_customers', {
			title: "All Customers",
			customers: customers_data
		})
	})
	.catch(err => {
		console.log(err);

		req.flash('errors', { msg: "Error pulling up all customers"});
		return res.redirect('/customers/list');
	})
}

/*
	POST /customers/phone/lookup
	Ajax will send a request that we will then lookup
*/
exports.postCheckCustomerPhone = (req, res) => {

	const json = req.body;
	const json_response = {};
	json_response["msg_type"] = "server_response";

	if("msg_type" in json && json["msg_type"] == "server_request") {
		if("phone" in json) {

			const phone_num = json["phone"];
			const query = { "phone": phone_num };

			return db.search("Customers", query)
			.then(resp => {
				// Data checking, we want to return the user a message is nothing is found
				if(resp.metadata.found == 0) {
					json_response["status"] = "error";
					return res.json( json_response );
				} else {
					const customer_data = resp.docs[0];

					json_response["status"] = "success";
					json_response["customer_data"] = customer_data;
					return res.json( json_response );
				}
			})
			.catch(err => {
				console.log(err);

				json_response["status"] = "error";
				return res.json( json_response );
			})
		}
	}
}
