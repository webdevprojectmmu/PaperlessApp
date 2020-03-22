var express = require('express');
var router = express.Router();
const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBUSERNAME+':'+process.env.DBPASSWORD+'@'+process.env.DBURL+':'+process.env.DBPORT+'/'+process.env.DATABASE+'');
const Item = sequelize.import("../model/item");
const OrderItems = sequelize.import("../model/order_item");
const Order = sequelize.import("../model/order");

Order.belongsToMany(Item,{foreignKey:"order_id", foreignKeyConstraint: true,through:OrderItems})
Item.belongsToMany(Order,{foreignKey: "item_id", foreignKeyConstraint: true,through:OrderItems})

/* GET home page. */
router.get('/', function(req, res, next) {
  Item.findAll( {include:{all:true, nested:true}}).then(result => {
    res.render("waiter", {item: result})
  })
});

router.post('/', async function(req, res, next) {
  console.log("Post made");
  let order = req.body;
  console.log(order);

  const theOrder = await Order.create({ staff_id: 2, table_num: 12 });
  console.log(theOrder instanceof Order); // true
  console.log(theOrder.toJSON());

  for(let i = 0; i < order.length; i++) {
    const theItems = await OrderItems.create({ order_id: theOrder.order_id, item_id: order[i].item_id, quantity: order[i].quantity });
    console.log(theItems instanceof OrderItems); // true
    console.log(theItems.toJSON());
  }

});
module.exports = router;