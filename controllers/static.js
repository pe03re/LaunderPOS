const db = require('../utils/db');
const Soap = require('../models/Soap');

/*
	GET /
	Gets the buttons for quick action redirection
*/
exports.getHome = (req, res) => {
	return res.render('static/home', {
		title: 'Home',
	})
}
