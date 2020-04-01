
module.exports = function(sequelize,DataType) {

    return sequelize.define("billing",{
    bill_id:{
        type: DataType.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    order_id:{
        type: DataType.INTEGER.UNSIGNED,
    },
    time_complete:{
        type: DataType.DATE(3),
        defaultValue: DataType.NOW
    },
    total:{
        type: DataType.INTEGER.UNSIGNED
    }
},{
        freezeTableName: true,
        timestamps: false
    })

}