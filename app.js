var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Sequelize = require("sequelize");
const dotenv = require("dotenv").config({path: __dirname+"/.env"});
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');

sequelize.authenticate().then(() => {
      console.log('Connection has been established successfully.');
    }).catch(err => {
      console.error('Unable to connect to the database:', err);
    });

const StaffRole = sequelize.import(__dirname + "/model/staff_role");
const Staff = sequelize.import(__dirname + "/model/staff");
const Payment = sequelize.import(__dirname + "/model/payment");
const Orders = sequelize.import(__dirname + "/model/orders");
const OrderItems = sequelize.import(__dirname + "/model/order_item");
const Order = sequelize.import(__dirname + "/model/order");
const Item = sequelize.import(__dirname + "/model/item");
const CookedOrders = sequelize.import(__dirname + "/model/cooked_orders");
const CompleteOrders = sequelize.import(__dirname + "/model/complete_orders");
const Category = sequelize.import(__dirname + "/model/category");
const Billing = sequelize.import(__dirname + "/model/billing");
const BillPayments = sequelize.import(__dirname + "/model/bill_payments");

// HOW TO CALL THE RELATIONSHIPS FOR THE MODELS

// STAFF_ROLE,PAYMENT,ORDERS,COOKED_ORDERS,COMPLETE_ORDERS & CATEGORY HAVE NO FOREIGN KEYS TO RELATE TO.

// STAFF
StaffRole.hasOne(Staff, {foreignKey:"staff_id", foreignKeyConstraint: true});

// PAYMENT
BillPayments.hasOne(Payment,{foreignKey:"payment_id", foreignKeyConstraint: true});
BillPayments.hasOne(Billing,{foreignKey:"bill_id", foreignKeyConstraint: true});

// ORDERS
Order.hasOne(Staff,{foreignKey:"staff_id", foreignKeyConstraint: true});
OrderItems.hasOne(Order,{foreignKey:"order_id", foreignKeyConstraint: true});
OrderItems.hasOne(Item,{foreignKey:"item_id", foreignKeyConstraint: true});

//CATEGORY
Category.hasOne(Item, {foreignKey:"category_id", foreignKeyConstraint: true});










// Find all users


var indexRouter = require('./routes/index');
var billingRouter = require('./routes/billing');
var ordersRouter = require("./routes/orders");

var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/orders', ordersRouter);
app.use('/billing', billingRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
