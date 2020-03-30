const express = require('express');
const router = express.Router();

const keyPublishable = process.env.KEYPUBLISHABLE;
const keySecret = process.env.KEYSECRET;
const stripe = require('stripe')(keySecret);
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
BillPayments.hasMany(Payment,{foreignKey:"payment_id",foreignKeyConstraint: true })
Payment.belongsToMany(Billing, {foreignKey:"payment_id",foreignKeyConstraint: true, through: BillPayments });
BillPayments.hasMany(Billing,{foreignKey:"bill_id",foreignKeyConstraint: true })
Billing.belongsToMany(Payment, {foreignKey:"bill_id",foreignKeyConstraint: true,through:BillPayments});
CookedOrders.belongsTo(Order,{foreignKey:"order_id", foreignKeyConstraint: true})
Order.hasOne(CookedOrders,{foreignKey:"order_id", foreignKeyConstraint: true})



var findOrderByID = function (id, callback) {
    Order.findAll().then(result => {


        console.log(result.order_id)
        for (let i = 0; i < result.length; i++) {


            if (result[i].order_id == id) return callback(null, result[i].order_id);
        }

        return callback(new Error(
            'No Order matching '
            + id
            )
        );
    })

};

var findOrderByIDMiddleware = function(req, res, next){
    if (req.params.id) {
        console.log('Order ID param was detected: ', req.params.id)
        findOrderByID(req.params.id, function(error, id){
            if (error) return next(error);
            req.user = id;
            return next();
        })
    } else {
        return next();
    }
};
router.get('/:id',authenticationMiddleware(), findOrderByIDMiddleware, function(req, res) {

  stripe.balance.retrieve(function(err, balance) {

      Order.findAll({where:{order_id: req.params.id}, include:{all:true, nested:true}}).then(result => {
          //Billing.create({total: result.items.cost*result.items.order_items.quantity})


              res.render("index", {
                  order: result,
                  bal: balance,
                  keyPublishable,
                  id: req.params.id,
                  title: "Billing",

              });

      })

  });
});
router.post("/charge/:id", (req, res) => {
    Order.findAll({where:{order_id: req.params.id},include:{all:true, nested:true}}).then((data) => {
        console.log(JSON.stringify(data[0].order_id,null,6))
        Billing.create({
            order_id: data[0].order_id,
            time_complete: Date.now(),
            total: req.body.total
        }).then(d=> console.log("hello "+d))
        let amount = req.body.total
        if (req.body.addDiscounts == "6UsM3uUv") {
            stripe.customers.create({
                email: req.body.stripeEmail,
                source: req.body.stripeToken
            })
                .then(
                    stripe.coupons.retrieve(
                        req.body.addDiscounts,
                        function (err, coupon) {
                            let percentage = (coupon.percent_off / 100) * amount;
                            amount = amount - percentage;

                        }
                    ))
                .then(customer =>
                    stripe.charges.create({
                        amount,
                        currency: "gbp",
                        customer: customer.id
                    }))
                .then((total)=> {
                    Payment.create({
                        amount: total.amount,
                        discount: total.discount
                    }).then(result=>{
                        console.log(result.amount)

                            res.render("charge", {charge: result, title:"Charge"})
                    })

                })
        } else {
            stripe.customers.create({
                email: req.body.stripeEmail,
                source: req.body.stripeToken
            }).then(customer =>
                stripe.charges.create({
                    amount,
                    currency: "gbp",
                    customer: customer.id
                })).then((total)=> {
                    Payment.create({
                            amount: total.amount,
                            discount: 0
                        }).then(result=>{
                        console.log(result.amount)

                            res.render("charge", {charge: result,title:"Charge"})

                    })

                    })


        }
    })
});

router.get("/charge",function (req,res) {
res.redirect("/orders")
});

router.post("/charge/cash/:id", (req, res) => {
    Order.findAll({where:{order_id: req.params.id},include:{all:true, nested:true}}).then((data) => {
        console.log(JSON.stringify(req.body,null,6))
        Billing.create({
            order_id: data[0].order_id,
            time_complete: Date.now(),
            total: req.body.total
        }).then(d=> {
            console.log("hello " + d)

            let amount = req.body.total;
            console.log(JSON.stringify(req.body, null, 6))
            if (req.body.addDiscounts === "6UsM3uUv") {
                let percentage = (10 / 100) * amount;
                let dAmount = amount - percentage;
                Payment.create({
                    amount: dAmount,
                    discount: 10
                }).then(result => {
                    console.log(result)

                        res.render("charge", {charge: result, title: "Charge"})

                })
            } else {
                Payment.create({
                    amount: amount,
                    discount: 0
                }).then(result => {
                    console.log("D VALUE "+JSON.stringify(d,null,6))
                    console.log("RESULT VALUE "+JSON.stringify(result, null, 6) + req.body.addDiscounts)

                    BillPayments.create({bill_id:d.bill_id,payment_id: result.payment_id}).then( n => {

                            res.render("charge", {charge: result, title: "Charge"})
                            console.log(JSON.stringify(n, null, 6))

                    })
                })
            }
        })
            })
});



router.get('*', function(req, res){
    res.send('Sorry, this is an invalid URL.');
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
                    return res.redirect('/waiter')
                }
                else if (role[0].role === 4) {

                    return next()

                }

            })

        } else {
            res.redirect('/orders/login')
        }
    }
}
module.exports = router;
