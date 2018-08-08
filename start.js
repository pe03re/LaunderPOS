'use strict';
const dotenv = require('dotenv');
dotenv.load({ path: '.env.example' }); // load environment variables

const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');

// Connect to MongoDB
return mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true
})
.then(() => {
	console.log('Connected to MongoDB');

	// Start Express Server
	const httpServer = http.createServer(app);
	const httpPort = process.env.NODE_ENV === 'production' ? 80 : 8000;
	httpServer.listen(httpPort);
	console.log(`Express http server listening on port ${httpPort}`);
})
.catch(err => {
	console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
	console.log(err);
	process.exit(1);
});
