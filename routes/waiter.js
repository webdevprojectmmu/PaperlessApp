var express = require('express');
var router = express.Router();
const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');
const Item = sequelize.import("../model/item");
const OrderItems = sequelize.import("../model/order_item");

/* GET home page. */
router.get('/', function(req, res, next) {
  Item.findAll( {include:{all:true, nested:true}}).then(result => {
    res.render("waiter", {item: result})
  })
});

router.post('/', function(req, res, next) {
  console.log("Post made");
  let thing =  req.body;
  console.log(thing);
});
module.exports = router;