var express = require('express');
var router = express.Router();
const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');
const Item = sequelize.import("../model/item");

/* GET home page. */
router.get('/', function(req, res, next) {
  Item.findAll( {include:{all:true, nested:true}}).then(result => {
    res.render("waiter", {item: result})
  })
});

module.exports = router;