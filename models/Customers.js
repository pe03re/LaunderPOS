const mongoose = require('mongoose');

/**
	Customer information will be pulled from Drop off tickets and stored here for book keeping.
**/

const CustomersSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	address: {
		street: String,
		city: String,
		state: String,
		zip: String
	},
	email: String,
	phone: String,
	date_registered: String,
	drop_offs: [] // Array of Drop Off tickets that will be stored here
});

const Customers = mongoose.model('Customers', CustomersSchema);

module.exports = Customers;
