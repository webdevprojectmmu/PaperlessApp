var express = require('express');
var router = express.Router();
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
        res.redirect("/waiter")
    }
);

router.get("/login", function (req,res) {

    res.render("loginWaiter",{title: "Login", login:req.isAuthenticated()})
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
    Item.findAll( {include:{all:true, nested:true}}).then(result => {
        Staff.findOne({where:{staff_id:req.user.staff_id}}).then((user)=> {
            res.render("waiter", {item: result, user:user})
        })
    })
});

router.post('/', async function(req, res, next) {
    console.log("Post made");
    let order = req.body;
    console.log(order);

    const theOrder = await Order.create(order[0]);
    console.log(theOrder instanceof Order); // true
    console.log(theOrder.toJSON());

    for(let i = 1; i < order.length; i++) {
        const theItems = await OrderItems.create({ order_id: theOrder.order_id, item_id: order[i].item_id, quantity: order[i].quantity });
        console.log(theItems instanceof OrderItems); // true
        console.log(theItems.toJSON());
    }

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
                    return res.redirect('/kitchen')
                }
                else if (role[0].role === 3) {
                    return next()
                }
                else if (role[0].role === 4) {

                    return res.redirect('/orders')

                }

            })

        } else {
            res.redirect('/waiter/login')
        }
    }
}
module.exports = router;