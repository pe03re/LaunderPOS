const db = require('../utils/db');
const Soap = require('../models/Soap');

/*
 	GET /overview/soap
	Quick Overview of Soap for easy checkout
*/
exports.getSoapOverview = (req, res) => {
	return db.search('Soap', {})
	.then(resp => {
		const soap_data = resp.docs;

		for(let i=0; i<soap_data.length; i++) {
			soap_data[i].USD = (soap_data[i].price) / 100;
		}

		return res.render('soaps/overview_soap', {
			title: 'Overview - Soap',
			soaps: soap_data
		})
	})
}
