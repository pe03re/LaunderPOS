/*
	All functions related to drop-offs
*/
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
		/*
		 	Here we need to do to two things:
			1. Increment the number of ticket orders (starting at 1, based on the number of dropoffs existed)
			2. Create a customer IF the customer does not currently exist
		*/
		const dropOff_data = resp.doc;

		// Once we create the drop off order, we are going to add the customer information to our database
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
			drop_offs: dropOff_data
		}



		req.flash('success', { msg: 'Dropoff has been successfully added!'});
		return res.redirect('/drop-off/create');
	})
	.catch(err => {
		console.log(err);

		req.flash('errors', { msg: 'Error in adding dropoff. Please try again'});
		return res.redirect('/drop-off/create');
	})
}
