module.exports = function(sequelize,DataType) {

    return sequelize.define("bill_payments",{
    bill_id:{
        type: DataType.INTEGER.UNSIGNED,
        primaryKey: true
    },
    payment_id:{
        type: DataType.INTEGER.UNSIGNED,
        primaryKey: true
    }

},{
        freezeTableName: true,
        timestamps: false
    })

}
