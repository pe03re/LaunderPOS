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

// Morgan Configs
app.use(morgan(':date[iso] :status :method :url [:response-time ms] :remote-addr'));

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
const dropOffController = require('./controllers/drop-off');
const customersController = require('./controllers/customer');
const transactionController = require('./controllers/transaction');
const inventoryController = require('./controllers/inventory');

// Static
app.get('/', staticController.getHome);

// Soaps
app.get('/overview/soap', soapController.getSoapOverview);

// DropOffs
app.get('/overview/dropoff', dropOffController.getDropOffForm);
app.post('/dropoff/update/status', dropOffController.postUpdateDropoffStatus);

// Customers
app.get('/customers/list', customersController.getCustomersList);
app.post('/customers/phone/lookup', customersController.postCheckCustomerPhone);

// Transactions API
app.post('/transaction/cart/add', transactionController.postAddToCart);
app.get('/transaction/cart/get', transactionController.getCurrentTransaction);
app.post('/transaction/cart/clear', transactionController.postClearTransaction);
app.post('/transaction/cart/checkout', transactionController.postCheckoutTransaction);

// Inventory API
app.get('/inventory', inventoryController.getInventoryView);
app.get('/inventory/get', inventoryController.getInventory);
app.post('/inventory/add', inventoryController.postAddInventory);
app.post('/inventory/update/soap', inventoryController.postUpdateSoapInventory);

module.exports = app;
