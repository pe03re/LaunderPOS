const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const SoapSchema = new mongoose.Schema({
	name: String,
	price: { type: Currency },
	quantity: {
		type: Number,
		default: 1 
	}
});

const Soap = mongoose.model('Soap', SoapSchema);

module.exports = Soap;
