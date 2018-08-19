const db = require('../utils/db');
const Soap = require('../models/Soap');

/*
 	GET /overview/soap
	Quick Overview of Soap for easy checkout
*/
exports.getSoapOverview = (req, res) => {
	return db.search('Soap', {})
	.then(resp => {
		const soap_data = resp.docs; // All soap data
		let in_stock_soap = [];

		// Loop through our soap collection, we should not add soaps of quantity less than 0
		for(let i=0; i<soap_data.length; i++) {
			if(soap_data[i].quantity > 0) {
				in_stock_soap.push(soap_data[i]);
			}
		}

		// Then we want to affix a "USD" property so that the price is human readable
		for(let i=0; i<in_stock_soap.length; i++) {
			in_stock_soap[i].USD = (in_stock_soap[i].price) / 100;
		}

		return res.render('soaps/overview_soap', {
			title: 'Overview - Soap',
			soaps: in_stock_soap
		})
	})
}
