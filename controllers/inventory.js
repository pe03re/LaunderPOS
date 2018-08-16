/*
	Inventory will serve as an api, where the client side will submit a JSON request object will information telling the api what to do

	1.) When a soap is created, it will be added to the soap model, but additionally it will be added here as well.

	2.) When a dropoff is selected as hold, instead of checking out, it will be added here
*/

const db = require('../utils/db');
const Soap = require('../models/Soap');
const DropOffs = require('../models/Drop-off');


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
		db.search('Soap', {}),
		db.search('DropOffs', { "status": "hold" }) // Only query hold items
	])
	.then(resp => {

		// Arrays of items
		const inventory_soaps = resp[0].docs;
		const inventory_dropOffs = resp[1].docs;

		// Return json_response
		json_response["status"] = "success";
		json_response["soaps_data"] = inventory_soaps;
		json_response["dropOffs_data"] = inventory_dropOffs;
		return res.json( json_response );
	})
	.catch(err => {
		console.log(err);
		json_response["status"] = "error";
		json_response["status_msg"] = "There has been an server error";
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
					json_response["status"] = "error";
					json_response["status_msg"] = "Soap already exists!";
					return res.json( json_response );

					// Otherwise, we proceed with adding the soap to our database, and adding it to our inventory as well
				} else {
					return db.createDoc('Soap', newSoapObj)
					.then(resp => {
						const new_soap = resp.doc;

						json_response["status"] = "success";
						json_response["status_msg"] = "Soap added!";
						return res.json( json_response );
					})
				}
			})
			.catch(err => {
				console.log(err);

				json_response["status"] = "error";
				json_response["status_msg"] = "There has been an server error";
				return res.json( json_response );
			})
		}
	}
}
