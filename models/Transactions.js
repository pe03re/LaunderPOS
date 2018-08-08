const mongoose = require('mongoose');

/**
	All transactions will be added here post checkout.
**/

const TransactionSchema = new mongoose.Schema({
	date: String,
	total_price: Number,
	sales: [] // Array that stores what sale object is added as part of the transaction
});

const Transactions = mongoose.model('Transactions', TransactionSchema);

module.exports = Transactions;
