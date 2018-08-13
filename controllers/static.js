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
	return res.render('static/home', {
		title: 'Home',
	})
}
