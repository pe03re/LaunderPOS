const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

/*
	Drop off tickets store a ticket_number starting at 1, and increases per drop off.

	The customer information will be stored here temporarily, and eventually pushed to Customer.js, where the information will be stored there, along with the Dropoff tickets
*/

const DropOffSchema = new mongoose.Schema({
	ticket_number: Number,
	status: String , // paid, hold
	date: String,
	customer_firstName: String,
	customer_lastName: String,
	customer_address: {
		street: String,
		city: String,
		state: String,
		zip: String
	},
	customer_email: String,
	customer_phone: String,
	price: { type: Currency },
	bag_color: String
});

const DropOffs = mongoose.model('DropOffs', DropOffSchema);

module.exports = DropOffs;
