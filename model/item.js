module.exports = function(sequelize,DataType) {

    return sequelize.define("item", {
        item_id: {
            type: DataType.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        category_id: {
            type: DataType.INTEGER.UNSIGNED
        },
        name: {
            type: DataType.STRING
        },
        cost: {
            type: DataType.INTEGER.UNSIGNED
        }
    },{
        freezeTableName: true,
        timestamps: false
    })
}