const mongoose = require('mongoose');

const CustomersSchema = new mongoose.Schema({
	name: String,
	email: String,
	phone: String,
});

const Customers = mongoose.model('Customers', CustomersSchema);

module.exports = Customers;
