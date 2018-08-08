/**
	Index of all Models

	Used for utils/db.js
**/

const Customers = require("./Customers");
const Dropoffs = require('./Drop-off');
const Soap = require('./Soap');
const Transactions = require('./Transactions');

module.exports = {
	Customers,
	Dropoffs,
	Soap,
	Transactions
};
