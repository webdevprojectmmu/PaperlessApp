module.exports = function(sequelize,DataType) {

    return sequelize.define('orders', {

        id: {
            type: DataType.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        table: {
            type: DataType.INTEGER,
            allowNull: false
        },
        createdAt: {
            type: DataType.DATE,
           // defaultValue: sequelize.fn("NOW")
        },
        updatedAt: {
            type: DataType.DATE,
            //defaultValue: sequelize.fn("NOW")
        },
    },{
        freezeTableName: true,
        timestamps: false
    })

}

