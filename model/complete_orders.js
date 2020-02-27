
module.exports = function(sequelize,DataType) {

    return sequelize.define("complete_orders",{
    complete_id:{
        type: DataType.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    time_complete:{
        type: DataType.DATE(3),
        //defaultValue: sequelize.literal('CURRENT_TIMESTAMP(3)'),
    },
    order_details:{
        type: DataType.STRING
    }
},{
        freezeTableName: true,
        timestamps: false
    })

}