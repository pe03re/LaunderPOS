exports.getHome = (req, res) => {
	return res.render('static/home', {
		title: 'Home',
	})
}
