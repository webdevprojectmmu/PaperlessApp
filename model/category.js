
module.exports = function(sequelize,DataType) {

    return sequelize.define("category",{
    category_id:{
        type: DataType.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    name:{
        type: DataType.STRING
    }
},{
        freezeTableName: true,
        timestamps: false
    })

}