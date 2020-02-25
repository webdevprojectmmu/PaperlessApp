var express = require('express');
var router = express.Router();

/* GET home page. */


router.get('/', function(req, res, next) {

    const orders =[{
        id: 101,
        item: "Beef fried rice",
        price: 1200,
        quantity: 3,
        table: 4
    },{
        id: 102,
        item:"Chicken fried rice",
        price: 1200,
        quantity: 2,
        table: 11,
    }]


        res.render("orders", { orders:orders })

});

module.exports = router;
