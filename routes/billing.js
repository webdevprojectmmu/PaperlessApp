const express = require('express');
const router = express.Router();

const keyPublishable = process.env.KEYPUBLISHABLE;
const keySecret = process.env.KEYSECRET;
const stripe = require('stripe')(keySecret);
const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');
const Billing = sequelize.import("../model/billing");







var findOrderByID = function (id, callback) {
    Billing.findAll().then(result => {


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
router.get('/:id', findOrderByIDMiddleware, function(req, res) {

  stripe.balance.retrieve(function(err, balance) {

      Billing.findOne({where:{order_id: req.params.id}}).then(result => {
          res.render("index", {
              order: result,
              bal: balance,
              keyPublishable,
              id: req.params.id
          });
      })

  });
});
router.post("/charge", (req, res) => {
    Billing.findOne({where:{order_id: req.body.orderID}}).then(result => {
        let amount = result.total;
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
                            amount = amount.toFixed() * 100

                        }
                    ))
                .then(customer =>
                    stripe.charges.create({
                        amount,
                        currency: "gbp",
                        customer: customer.id
                    }))
                .then(charge => res.render("charge", {charge: charge}))
        } else {
            amount = amount.toFixed() * 100;
            stripe.customers.create({
                email: req.body.stripeEmail,
                source: req.body.stripeToken
            }).then(customer =>
                stripe.charges.create({
                    amount,
                    currency: "gbp",
                    customer: customer.id
                })).then(charge => {
                    Billing.create({
                        order_id: req.body.orderID,
                        total: charge.amount
                    }).then((total)=> {
                        console.log(total)
                        res.render("charge", {charge: total})
                    })
            })

        }
    })
});

router.get("/charge",function (req,res) {
res.redirect("/orders")
});




router.get('*', function(req, res){
    res.send('Sorry, this is an invalid URL.');
});

module.exports = router;
