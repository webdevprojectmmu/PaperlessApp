
module.exports = function(sequelize,DataType) {

    return sequelize.define("payment",{
    payment_id:{
        type: DataType.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    amount:{
        type: DataType.INTEGER.UNSIGNED
    },
    discount:{
        type: DataType.STRING
    }
},{
        freezeTableName: true,
        timestamps: false
    })

}