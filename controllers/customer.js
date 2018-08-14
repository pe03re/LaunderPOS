const db = require('../utils/db');
const Customers = require('../models/Soap');

/*
	GET List of Customers
	/customers/all
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
