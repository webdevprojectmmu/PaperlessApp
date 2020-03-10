var express = require('express');
var router = express.Router();
const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');
const Item = sequelize.import("../model/item");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('waiter',{title: "Hi Waiter"});
    Item.findAll().then(item => {
        console.log(item);
      })
});

module.exports = router;