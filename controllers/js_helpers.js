module.exports = {
	checkForNull
};

function checkForNull(var, field) {
	if(field != undefined || field != null) {
		var = field;
	}
};
