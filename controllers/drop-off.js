const db = require('../utils/db');
const DropOffs = require('../models/Drop-off');
const Customers = require('../models/Customers');

/*
	GET /drop-off/create
	Creates a dropoff
*/
exports.getDropOffForm = (req, res) => {
	return res.render('drop-off/drop-off_form', {
		title: 'Drop-off',
	})
}

/*
	POSt /drop-off/create
	Add a dropoff to database and adds the customer to our database
*/
exports.postCreateDropOff = (req, res) => {

	// Global variables to keep in scope
	let dropOff_id;
	let dropOff_data;
	let dropOff_ticket_num;

	let price;
	let bag_color;
	let status;
	let firstName;
	let lastName;
	let email;
	let phone;
	let street;
	let city;
	let state;
	let zip;

	// validations
	if(req.body.price != undefined || req.body.price != null) {
		price = req.body.price;
	}
	if(req.body.bag_color != undefined || req.body.bag_color != null) {
		bag_color = req.body.bag_color;
	}
	if(req.body.status != undefined || req.body.status != null) {
		status = req.body.status;
	}
	if(req.body.firstName != undefined || req.body.firstName != null) {
		firstName = req.body.firstName;
	}
	if(req.body.lastName != undefined || req.body.lastName != null) {
		lastName = req.body.lastName;
	}
	if(req.body.email != undefined || req.body.email != null) {
		email = req.body.email;
	}
	if(req.body.phone != undefined || req.body.phone != null) {
		phone = req.body.phone;
	}
	if(req.body.street != undefined || req.body.street != null) {
		street = req.body.street;
	}
	if(req.body.city  != undefined || req.body.city  != null) {
		city = req.body.city;
	}
	if(req.body.state != undefined || req.body.state != null) {
		state = req.body.state;
	}
	if(req.body.zip != undefined || req.body.zip != null) {
		zip = req.body.zip;
	}

	// Dropoff object
	const newDropOff = {
		status: status,
		date: Date.now(),
		customer_firstName: firstName,
		customer_lastName: lastName,
		customer_email: email,
		customer_phone: phone,
		customer_address: {
			street: street,
			city: city,
			state: state,
			zip: zip
		},
		price: price,
		bag_color: bag_color
	}

	return db.createDoc('DropOffs', newDropOff)
	.then(resp => {

		dropOff_data = resp.doc;
		// We want the id of the dropoff so we can update the dropoff with a ticket number
		dropOff_id = dropOff_data._id;

		/*
		 	Here we need to do to two things:
			1. Increment the number of ticket orders (starting at 1, based on the number of dropoffs existed)
			2. Create a customer IF the customer does not currently exist
		*/

		// We should search the database for the amoiunt of dropoffs for the ticket number, search the database to find a match in our customers if any
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
		}

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
		}

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

		req.flash('success', { msg: 'Dropoff has been successfully added!'});
		return res.redirect('/drop-off/create');
	})
	.catch(err => {
		console.log(err);

		req.flash('errors', { msg: 'Error in adding dropoff. Please try again'});
		return res.redirect('/drop-off/create');
	})
}
