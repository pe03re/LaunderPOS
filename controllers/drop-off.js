const db = require('../utils/db');
const DropOffs = require('../models/Drop-off');
const Customers = require('../models/Customers');

/*
	GET /drop-off/create
	Get page for Dropoff
*/
exports.getDropOffForm = (req, res) => {
	return res.render('drop-off/overview_dropoff', {
		title: 'Drop-off',
	})
};
