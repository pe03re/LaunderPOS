const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

/*
	All Detergents, or Soaps will be stored in our database
	Only one type (ie. Tide) of soap can exist.

	The controller 'soap.js' has a function that checks to check if the soap already exists
*/

const SoapSchema = new mongoose.Schema({
	name: String,
	price: { type: Currency },
	original_price: { type: Currency}, // Wholesale price
	barcode_id: String,
	quantity: {
		type: Number,
		default: 1
	}
});

const Soap = mongoose.model('Soap', SoapSchema);

module.exports = Soap;
