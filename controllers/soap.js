/**
	All logic related to Soaps
**/
const db = require('../utils/db');
const Soap = require('../models/Soap');

/*
	GET /inventory/soap
	List all Soaps in Inventory
*/
exports.getSoapInventory = (req, res) => {

	return db.search('Soap', {})
	.then(resp => {
		const soaps = resp.docs;

		let i=0;
		for(i; i<soaps.length; i++) {
			soaps[i].USD = (soaps[i].price)/100; // Render correct USD format to User
		}

		return res.render('soaps/all_soaps', {
			title: 'Soap Inventory',
			soaps: soaps
		})
	})
}

/*
	POST /inventory/soap
	Add a Soap to Inventory
*/
exports.postCreateSoap = (req, res) => {

	let name;
	let price;
	let allSoaps;
	let i=0;

	// User input validations
	if(req.body.name != null || req.body.name != undefined) {
		name = (req.body.name).toUpperCase();
	}

	if(req.body.price != null || req.body.price != undefined) {
		price = req.body.price;
	}

	const newSoapObj = {
		name: name,
		price: price
	};

	let soapExists = false; // Bool to check for if a soap already exists

	return db.search('Soap', {})
	.then(resp => {
		const allSoapsData = resp.docs;

		// We will need to loop through the array of data and compare the value of each name, and see if it matches the input value of name. If it does, that means that the Soap already exists, in which case we should throw an error
		if(allSoapsData.length > 0) {
			for(let i=0; i<allSoapsData.length; i++) {
				if(allSoapsData[i].name == name) {
					soapExists = true;
				}
			}
		};

		// We will then check if soapExists is true, if it is then we will redirect the user to the inventory page with an error message
		if(soapExists == true) {
			req.flash('errors', { msg: 'Soap already exists!'});
			return res.redirect('/inventory/soap');

			// Otherwise, we proceed with adding the soap to our database
		} else {
			return db.createDoc('Soap', newSoapObj)
			.then(resp => {
				const newSoapData = resp.doc;
				console.log(newSoapData);

				req.flash('success', { msg: 'Soap has been successfully added!'});
				return res.redirect('/inventory/soap');
			})
		}
	})
	.catch(err => {
		console.log(err);
		req.flash('errors', { msg: 'Error in adding soap. Please try again'});
		return res.redirect('/inventory/soap');
	})
}

/*
	PUT /update/soap/:soapId
	Update properties of a Soap
*/
exports.updateSoaps = (req, res) => {

	const soapId = req.params.soapId;
	let quantity;
	let price;

	if(req.body.quantity != undefined || req.body.quantity != null) {
		quantity = req.body.quantity;
	}

	if(req.body.price != undefined || req.body.price != null) {
		price = req.body.price;
	}

	const update = {
		quantity: quantity,
		price: price
	};

	return db.updateById('Soap', soapId, update)
	.then(resp => {
		const soapData = resp.doc;

		req.flash('success', { msg: 'Soap has been successfully updated!'});
		return res.redirect('/inventory/soap');
	})
	.catch(err => {
		console.log(err);
		req.flash('errors', { msg: 'Error in updating soap. Please try again'});
		return res.redirect('/inventory/soap');
	})
}
