var express = require('express');
var router = express.Router();
var io = require("socket.io");

const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');
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
BillPayments.belongsTo(Payment,{foreignKey:"payment_id"})
Payment.belongsToMany(Billing, {foreignKey:"payment_id", through: BillPayments });
BillPayments.belongsTo(Billing,{foreignKey:"bill_id"})
Billing.belongsToMany(Payment, {foreignKey:"bill_id",through:BillPayments});
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
            console.log(staffID)
            Staff.findOne({where: {staff_id: staffID}}).then((staffID,err)=>{
                if (staffID.role === 4){
                    const staff = staffID.staff_id
                    req.login(staff, function (err) {
                        Order.findAll( {include:{all:true, nested:true}}).then(result => {
                            res.render("orders", {orders: result, title:"Orders"})
                        })

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




router.post('/login',passport.authenticate('local'),
    function(req, res) {
        res.redirect("/kitchen")
    }
);

router.get("/login", function (req,res) {

    res.render("loginKitchen",{title: "Login", login:req.isAuthenticated()})
})

router.get("/logout", (req,res)=>{
    req.logout();
    req.session.destroy((err) => {
        res.clearCookie('connect.sid');
        res.redirect("login")
    });


})
/* GET home page. */
router.get('/',authenticationMiddleware (), function(req, res, next) {
    Staff.findOne({where:{staff_id:req.user.staff_id}}).then((user)=> {
        res.render("kitchen", {user:user})
    })



});
function authenticationMiddleware () {
    return function (req, res, next) {
        if (req.isAuthenticated()) {


            Staff.findAll({attributes: ["role"], where: {staff_id: req.user.staff_id}}).then((role) => {
                console.log(role[0].role)
                if (role[0].role === 1 ) {
                    return res.redirect('/admin')
                }
                else if (role[0].role === 2) {
                    return next()
                }
                else if (role[0].role === 3) {
                    return res.redirect('/waiter')
                }
                else if (role[0].role === 4) {

                    return res.redirect('/orders')

                }

            })

        } else {
            res.redirect('/kitchen/login')
        }
    }
}




module.exports = function (io) {
    // order object template. Each new order coming in should copy this object, populate values, and push to orders array.
    let order = {
        key: 0,
        table: 0,
        time: Date.now(),
        items: [{
            num: 0,
            name: "",
            qty: 0
        }]
    };

    io.on('connect', function (socket) {
        console.log(socket.id);

        // pushing incoming order to all clients
        // expected 'data' object: 'order' variable above.
        socket.on('push order', function (data) {
            console.log("Pushing order: " + JSON.stringify(data));
            io.sockets.emit('new order', data);
        });

        // pushing order completion to all clients
        // expected 'data' object: "" + order.key + order.table
        socket.on('complete order', function (data) {
            console.log('completing order: ' + data);
            io.sockets.emit('order complete', data);
        });

        // pushing quantity updates to all clients
        // expected 'data' object: {oid: "" + order.key + order.table, itemNum: order.items[n].num, completed: n}
        socket.on('qty update', function (data) {
            console.log('updating quantity: ' + JSON.stringify(data));
            io.sockets.emit('qty change', data);
        });
    });
    return router

};