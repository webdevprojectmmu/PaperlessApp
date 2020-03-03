var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require("dotenv").config({path: __dirname+"/.env"});


const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://' + process.env.DBUSERNAME + ':' + process.env.DBPASSWORD + '@' + process.env.DBURL + ':' + process.env.DBPORT + '/' + process.env.DATABASE);

var indexRouter = require('./routes/index');
var billingRouter = require('./routes/billing');
var ordersRouter = require("./routes/orders");
var waiterRouter = require("./routes/waiter");



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
app.use('/waiter', waiterRouter);

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

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = app;
