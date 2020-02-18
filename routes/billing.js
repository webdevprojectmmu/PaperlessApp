const express = require('express');
const router = express.Router();

const keyPublishable = process.env.KEYPUBLISHABLE;
const keySecret = process.env.KEYSECRET;
const stripe = require('stripe')(keySecret);




const orders ={
        id: 101,
        item: "Beef fried rice",
        price: 12.00,
        quantity: 3

};


var findOrderByID = function (id, callback) {
    // Perform database query that calls callback when it's done
    // This is our fake database!
    if (orders.id != id)
        return callback(new Error(
            'No Order matching '
            + id
            )
        );
    return callback(null, orders.id);
};

var findOrderByIDMiddleware = function(req, res, next){
    if (req.params.id) {
        console.log('Username param was detected: ', req.params.id)
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
  };

  const orders ={
    id: 101,
    item:"Beef fried rice",
    price: 1234,
    quantity: 3
  };

  stripe.balance.retrieve(function(err, balance) {

    res.render("index", {orders: orders, user: profile, food: menu, bal:balance, keyPublishable, id:req.params.id});
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
