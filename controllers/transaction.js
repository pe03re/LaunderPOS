/*
 	NOTE:
	Transactions should be active until marked "done" in status.
	Only one 'in progress' transaction should occur
	When that transaction is completed, it's status will be updated to "done"

	We should have mutiple routes:
	1.) GET, /transactions/get, Fetch database for 'in progress', 'done', the UI for this needs to appear on all pages that allows users to add items
	2.) POST, /transactions/checkout, Updates the database, and completes the fields of the object for transaction
*/

exports.getCurrentTransaction = (req, res) => {

};

exports.postCheckoutTransaction = (req, res) => {

};
