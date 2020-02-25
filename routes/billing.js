const express = require('express');
const router = express.Router();

const keyPublishable = process.env.KEYPUBLISHABLE;
const keySecret = process.env.KEYSECRET;
const stripe = require('stripe')(keySecret);

const profile={
    id: 1001,
    name: "Ryan Love",
    role: "Waiter",
    auth: "STANDARD"
};
const menu ={ food:[{
        name:"Chicken Fried Rice"
    },
        {name: "Beef Fried Rice"},
        {name: "Pork Fried Rice"}]
}


const orders =[{
        id: 101,
        items:[{
            item:"Beef fried rice",
            quantity: 2,
            price: 1300,
        },{
            item:"Chicken Fried rice",
            quantity: 3,
            price: 1200,

        }],


},{
        id: 102,
        items:[{
            item:"Beef fried rice",
            quantity: 2,
            price: 1300,
        },{
            item:"Pork Fried rice",
            quantity: 3,
            price: 1300,

        }],


    }]
;








var findOrderByID = function (id, callback) {
    for (let i = 0; i < orders.length ; i++) {


        if (orders[i].id == id) return callback(null, orders[i].id);
    }

        return callback(new Error(
            'No Order matching '
            + id
            )
        );

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

      res.render("index", {orders: orders, user: profile, food: menu, bal: balance, keyPublishable, id: req.params.id, arr:[], reducer:(accumulator, currentValue) => accumulator + currentValue});


  });
});
router.post("/charge", (req, res) => {

let amount = orders.price * orders.quantity;
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
          }))
      .then(charge => res.render("charge", {charge: charge}))
}
});

router.get("/charge",function (req,res) {
res.render("charge")
});




router.get('*', function(req, res){
    res.send('Sorry, this is an invalid URL.');
});

module.exports = router;
