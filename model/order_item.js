module.exports = function(sequelize,DataType) {

    return sequelize.define("order_items",{
    order_id: {
        type:DataType.INTEGER.UNSIGNED,
        primaryKey: true
    },
    item_id: {
        type:DataType.INTEGER.UNSIGNED,
        primaryKey: true
    },
    quantity:{
        type: DataType.INTEGER.UNSIGNED
    }
},{
        freezeTableName: true,
        timestamps: false
    })

}
