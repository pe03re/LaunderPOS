/*
	All logic of static pages
*/
const db = require('../utils/db');
const Soap = require('../models/Soap');

/*
	GET /
	This page will render all buttons for quick checking out of soap
*/
exports.getHome = (req, res) => {

	return db.search('Soap', {})
	.then(resp => {
		const soap_data = resp.docs;

		for(let i=0; i<soap_data.length; i++) {
			soap_data[i].USD = (soap_data[i].price) / 100;
		}

		return res.render('static/home', {
			title: 'Home',
			soaps: soap_data
		})
	})
}
