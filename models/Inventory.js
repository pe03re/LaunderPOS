/*
 	Inventory stores two types of objects
	1. Soap
	2. Dropoff

	Logic:
	When a soap is checkout, the quantity of soap will decline by one.

	When a dropoff is placed on "hold", instead of adding it to the cart, it will be placed here where the user can then add the dropoff to be paid and moved to cart.
*/
const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
	soaps: [],
	dropOffs: []
});

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
