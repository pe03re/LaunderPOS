/*
	Inventory will serve as an api, where the client side will submit a JSON request object will information telling the api what to do

	1.) When a soap is created, it will be added to the soap model, but additionally it will be added here as well.

	2.) When a dropoff is selected as hold, instead of checking out, it will be added here
*/

const db = require('../utils/db');
const Inventory = require('../models/Inventory');
const Soap = require('../models/Soap');


/*
	GET /inventory
	Render the view
*/
exports.getInventoryView = (req, res) => {
	return res.render('inventory/inventory_list', {
		title: "Inventory"
	})
}

/*
	GET /inventory/get
	Renders list of items in our inventory
*/
exports.getInventory = (req, res) => {

	// Prepare json response
	const json_response = {};
	json_response["msg_type"] = "server_response";

	// Query database for inventory items
	return Promise.all([
		db.search('Inventory', {})
	])
	.then(resp => {
		const inventory_data = resp[0].docs;

		// Arrays of items
		const inventory_soaps = inventory_data.soaps;
		const inventory_dropOffs = inventory_data.dropOffs;

		// Return json_response
		json_response["status"] = "success";
		json_response["soaps_data"] = inventory_soaps;
		json_response["dropOffs_data"] = inventory_dropOffs;
		return res.json( json_response );
	})
	.catch(err => {
		console.log(err);
		json_response["status"] = "error";
		json_response["err_data"] = err;
		return res.json( json_response );
	})
}

/*
	POST /inventory/add
	Add an item to the inventory
*/
exports.postAddInventory = (req, res) => {

	// Recieved request
	const json = req.body;

	// Prepare json response
	const json_response = {};
	json_response["msg_type"] = "server_response";

	/*
		NOTE: Json request to the api will let us know the item type
	*/
	// JSON Check
	if( "msg_type" in json && json["msg_type"] == "server_request" ) {

		// SOAP
		if("item_type" in json && json["item_type"] == "soap") {
			const new_soap_data = json["data"];

			const newSoapObj = {
				name: new_soap_data["name"],
				price: new_soap_data["price"]
			};

			// Add to database
			let soapExists = false; // Bool to check for if a soap already exists

			return db.search('Soap', {})
			.then(resp => {
				const all_soaps_data = resp.docs;

				// We will need to loop through the array of data and compare the value of each name, and see if it matches the input value of name. If it does, that means that the Soap already exists, in which case we should throw an error
				if(all_soaps_data.length > 0) {
					for(let i=0; i<all_soaps_data.length; i++) {
						if(all_soaps_data[i].name == new_soap_data["name"]) {
							soapExists = true;
						}
					}
				};

				// We will then check if soapExists is true, if it is then we will redirect the user to the inventory page with an error message
				if(soapExists == true) {
					req.flash('errors', { msg: 'Soap already exists!'});
					json_response["status"] = "error";
					return res.json( json_response );

					// Otherwise, we proceed with adding the soap to our database, and adding it to our inventory as well
				} else {
					return Promise.all([
						db.createDoc('Soap', newSoapObj),
						db.createDoc('Inventory', {})
					])
					.then(resp => {
						const new_soap = resp.doc;

						req.flash('success', { msg: 'Soap has been successfully added!'});
						json_response["status"] = "success";
						return res.json( json_response );
					})
				}
			})
			.catch(err => {
				console.log(err);
				req.flash('errors', { msg: 'Error in adding soap. Please try again'});
				json_response["status"] = "error";
				return res.json( json_response );
			})
		}
	}
}
