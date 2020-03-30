module.exports = function(sequelize,DataType) {

    return sequelize.define("order",{
    order_id: {
        type:DataType.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    staff_id:{
        type: DataType.INTEGER.UNSIGNED,
    },
    table_num:{
        type: DataType.INTEGER.UNSIGNED
    },
    order_made:{
        type: DataType.DATE(3),
        defaultValue: Date.now()
    }


},{
        freezeTableName: true,
        timestamps: false
    })

}