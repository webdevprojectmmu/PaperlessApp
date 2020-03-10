var express = require('express');
var router = express.Router();
const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');
const Op  = Sequelize.Op;
const Billing = sequelize.import("../model/billing");
const OrderItems = sequelize.import("../model/order_item");
const Order = sequelize.import("../model/order");
const Staff = sequelize.import("../model/staff");
const Item = sequelize.import("../model/item");
const Payment = sequelize.import("../model/payment");
const BillPayments = sequelize.import("../model/bill_payments");
const CookedOrders = sequelize.import("../model/cooked_orders");

Order.hasOne(Staff,{foreignKey:"staff_id", foreignKeyConstraint: true});
Staff.belongsTo(Order,{foreignKey:"staff_id", foreignKeyConstraint: true})


Order.belongsToMany(Item,{foreignKey:"order_id", foreignKeyConstraint: true,through:OrderItems})
Item.belongsToMany(Order,{foreignKey: "item_id", foreignKeyConstraint: true,through:OrderItems})

Billing.hasOne(Order,{foreignKey:"order_id", foreignKeyConstraint: true})
Order.belongsTo(Billing,{foreignKey:"order_id", foreignKeyConstraint: true})
BillPayments.hasMany(Payment,{foreignKey:"payment_id",foreignKeyConstraint: true })
Payment.belongsToMany(Billing, {foreignKey:"payment_id",foreignKeyConstraint: true, through: BillPayments });
BillPayments.hasMany(Billing,{foreignKey:"bill_id",foreignKeyConstraint: true })
Billing.belongsToMany(Payment, {foreignKey:"bill_id",foreignKeyConstraint: true,through:BillPayments});
CookedOrders.belongsTo(Order,{foreignKey:"order_id", foreignKeyConstraint: true})
Order.hasOne(CookedOrders,{foreignKey:"order_id", foreignKeyConstraint: true})
const bcrypt = require("bcryptjs");
const passport = require("passport");
/* GET home page. */



router.post("/register", (req,res) =>{
    const username = req.body.username;
    const name = req.body.name;
    const password = req.body.password
    const role = req.body.role

    bcrypt.hash(password, 8 , (err,hash) => {
        Staff.create({
            username: username,
            name: name,
            password: hash,
            role: role

        }).then((results,err)=>{
            if (err) throw err;
            const staffID = results.staff_id;
            Staff.findOne({where: {staff_id: staffID}}).then((staffID,err)=>{
                if (staffID.role === 4){
                    const staff = staffID.staff_id
                    req.login(staff, function (err) {
                        res.redirect("/orders")

                    })
                } else if(staffID.role === 3) {
                    const staff = staffID.staff_id
                    req.login(staff, function (err) {
                        res.redirect("/admin")

                    })
                } else if(staffID.role === 2) {
                    const staff = staffID.staff_id
                    req.login(staff, function (err) {
                        res.redirect("/waiter")

                    })
                }
                else if(staffID.role === 1) {
                    const staff = staffID.staff_id
                    req.login(staff, function (err) {
                        res.redirect("/kitchen")

                    })
                }


                });

        })
    })


});

passport.serializeUser(function(staff, done) {
    console.log(staff)
    done(null, staff);
});

passport.deserializeUser(function(staff, done) {
    console.log(staff)
    done(null, staff)
});




router.post('/login',passport.authenticate('local'),authenticationMiddleware(),
    function(req, res) {
        res.redirect("/orders")
    }
);

router.get("/login", function (req,res) {

    res.render("login")
})

router.get("/logout", (req,res)=>{
    req.session.destroy();
    req.logout();
    console.log(req.session)
    res.redirect("/orders/login")

})

router.get('/',authenticationMiddleware(), function(req, res) {
    console.log(req.isAuthenticated())
    console.log(req.user)
    Order.findAll( {include:{all:true, nested:true}}).then(result => {
        res.render("orders", {orders: result})
    })

});

router.get('/search', (req, res) => {
    let { q } = req.query;
    q = q.toLowerCase();

    Order.findAll({ where: { table_num: { [Op.like]: '%' + q + '%' } },include:{all:true, nested:true} })
        .then(orders => {console.log(orders); res.render('search', { orders })})
        .catch(err => console.log(err));
});

router.get('*', function(req, res){



    res.send('Sorry, this is an invalid URL.' + req.originalUrl+ '<br>' +
        'Press this link to return to parent directory <a href="/orders">Orders</a> or wait for redirect');
});



function authenticationMiddleware () {
    return function (req, res, next) {
        if (req.isAuthenticated()) {


            Staff.findAll({attributes: ["role"], where: {staff_id: req.user.staff_id}}).then((role) => {
                console.log(role[0].role)
                if (role[0].role === 4 || role[0].role === 1 ) {
                    return next()
                }
                else if (role[0].role === 2 || role[0].role === 3 ) {
                    return res.redirect('/orders/login')
                }

            })

        } else {
             return res.redirect('/orders/login')
        }
    }
}

module.exports = router;
