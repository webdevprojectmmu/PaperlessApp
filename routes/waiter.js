var express = require('express');
var router = express.Router();
const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBUSERNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');
const Item = sequelize.import("../model/item");
const OrderItems = sequelize.import("../model/order_item");
const Order = sequelize.import("../model/order");

Order.belongsToMany(Item,{foreignKey:"order_id", foreignKeyConstraint: true,through:OrderItems})
Item.belongsToMany(Order,{foreignKey: "item_id", foreignKeyConstraint: true,through:OrderItems})

const bcrypt = require("bcryptjs");
const passport = require("passport");


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
      res.redirect("/waiter")
  }
);

router.get("/login", function (req,res) {

  res.render("login",{title: "Login"})
})

router.get("/logout", (req,res)=>{
  req.session.destroy();
  req.logout();
  console.log(req.session)
  res.redirect("/waiter/login")

})


/* GET home page. */
router.get('/', authenticationMiddleware(), function(req, res, next) {
  console.log(req.isAuthenticated())
  console.log(req.user)
  Item.findAll( {include:{all:true, nested:true}}).then(result => {
    res.render("waiter", {item: result})
  })
});

router.post('/', async function(req, res, next) {
  console.log("Post made");
  let order = req.body;
  console.log(order);

  // create order
  const theOrder = await Order.create({ staff_id: 2, table_num: 12 });
  console.log(theOrder instanceof Order); // true
  console.log(theOrder.toJSON());

  // create items for order
  for(let i = 0; i < order.length; i++) {
    const theItems = await OrderItems.create({ order_id: theOrder.order_id, item_id: order[i].item_id, quantity: order[i].quantity });
    console.log(theItems instanceof OrderItems); // true
    console.log(theItems.toJSON());
  }
});


router.get('*', function(req, res){
  var count = 6;function countDown(){var timer = document.getElementById("timer");if(count > 0){count--;timer.innerHTML = "This page will redirect in "+count+" seconds.";setTimeout("countDown()", 1000);}else{window.location.href = "/orders";}}

  res.send('Sorry, this is an invalid URL.' + req.originalUrl+ '<br>' +
      'Press this link to return to parent directory <a href="/orders">Orders</a> or wait for redirect<script>' +
      'var count = 6;' +
      'function redirectClient(){' +
          'var numTi = document.getElementById("numTi");' +
          'if(count > 0){' +
              'count--;' +
              'numTi.innerHTML = "Redirect in "+count+" seconds.";' +
              'setTimeout("redirectClient()", 1000);' +
          '}else{' +
              'window.location.href = "/orders";' +
          '}' +
      '}' +
      '</script> <span id="numTi"><script type="text/javascript">redirectClient();</script></span>');
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