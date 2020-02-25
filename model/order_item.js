module.exports = function(sequelize,DataType) {

    return sequelize.define("order_item",{
    order_id: {
        type:sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    item_id: {
        type:sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    quantity:{
        type: sequelize.INTEGER.UNSIGNED
    }
},{
        freezeTableName: true,
        timestamps: false
    })

}

module.exports = OrderItem