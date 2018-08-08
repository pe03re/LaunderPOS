'use strict';
/*
	Modules
*/
const bodyParser = require('body-parser');
const compression = require('compression');
const exphbs  = require('express-handlebars');
const express = require('express');
const expressValidator = require('express-validator');
const flash = require('express-flash');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

/*
	Express Server
*/
const app = express();
app.use(compression());
app.use(expressValidator());
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handlebars Template Engine
const hbs = exphbs.create({
	defaultLayout: 'layout.hbs'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// Public/asset routes (css, client side javascript)
app.use(express.static(path.join(__dirname, 'public'), { etag: true }));

// Session
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.MONGODB_URI,
        autoReconnect: true
    })
}));

/*
	Controllers
*/
const staticController = require('./controllers/static');
const soapController = require('./controllers/soap');

// Static
app.get('/', staticController.getHome);

// Soaps
app.get('/inventory/soap', soapController.getSoapInventory);
app.post('/inventory/soap', soapController.postCreateSoap);
app.post('/update/soap/:soapId', soapController.updateSoaps);


module.exports = app;
