var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Sequelize = require("sequelize");
const bcrypt = require("bcryptjs")
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");
const SessionStore = require('express-session-sequelize')(session.Store);
const dotenv = require("dotenv").config({path: __dirname+"/.env"});
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');

sequelize.authenticate().then(() => {
      console.log('Connection has been established successfully.');
    }).catch(err => {
      console.error('Unable to connect to the database:', err);
    });

const sequelizeSessionStore = new SessionStore({
    db: sequelize,
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
StaffRole.hasMany(Staff, {foreignKey:"role", foreignKeyConstraint: true});
Staff.belongsTo(StaffRole,{foreignKey:"role", foreignKeyConstraint: true})
// PAYMENT
BillPayments.hasOne(Payment,{foreignKey:"payment_id", foreignKeyConstraint: true});
BillPayments.hasOne(Billing,{foreignKey:"bill_id", foreignKeyConstraint: true});

// ORDERS
Order.hasOne(Staff,{foreignKey:"staff_id", foreignKeyConstraint: true});
Staff.belongsTo(Order,{foreignKey:"staff_id", foreignKeyConstraint: true})
OrderItems.hasMany(Order,{foreignKey:"order_id", foreignKeyConstraint: true})
Order.belongsTo(OrderItems,{foreignKey:"order_id", foreignKeyConstraint: true})
OrderItems.hasOne(Item,{foreignKey:"item_id", foreignKeyConstraint: true})
Item.belongsTo(OrderItems,{foreignKey: "item_id", foreignKeyConstraint: true})
CookedOrders.belongsTo(Order,{foreignKey:"order_id", foreignKeyConstraint: true})
Order.hasOne(CookedOrders,{foreignKey:"order_id", foreignKeyConstraint: true})
//CATEGORY
Item.hasMany(Category, {foreignKey:"category_id", foreignKeyConstraint: true});
Category.belongsTo(Item, {foreignKey:"category_id", foreignKeyConstraint: true});

Payment.belongsToMany(Billing, {foreignKey:"payment_id",foreignKeyConstraint: true, through: BillPayments });
Billing.belongsToMany(Payment, {foreignKey:"bill_id",foreignKeyConstraint: true, through: BillPayments });

OrderItems.findAll({include:{all:true,nested:true}}).then(result =>{
  // console.log(JSON.stringify(result[0],null,2))
})





// Find all users

var app = express();
app.io = require('socket.io')();
var indexRouter = require('./routes/index');
var billingRouter = require('./routes/billing');
var ordersRouter = require("./routes/orders");
var kitchenRouter = require("./routes/kitchen")(app.io);
var adminRouter = require("./routes/admin");
var waiterRouter = require("./routes/waiter")



// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: process.env.SECRET ,store: sequelizeSessionStore,resave: false, saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
    (username, password, done) => {
    console.log(username);
    console.log(password);
    Staff.findAll({attributes:["staff_id","password"], where:{username:username}}).then((results,err) =>{
        if (err) {done(err)};
        if(results.length === 0){
            done(null,false)
        } else {
            console.log(results[0].password)
            const hash = results[0].password;
            bcrypt.compare(password, hash, (err, data) => {
                if (data === true) {
                    return done(null, {staff_id: results[0].staff_id})
                } else {
                    return done(null, false)
                }
            })
        }
    })
    }
))
app.use('/', indexRouter);
app.use('/orders', ordersRouter);
app.use('/billing', billingRouter);
app.use("/admin", adminRouter);
app.use("/kitchen", kitchenRouter);
app.use("/waiter", waiterRouter);


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
