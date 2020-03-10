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
           defaultValue:  Date.now()
        },
        updatedAt: {
            type: DataType.DATE,
            defaultValue: Date.now()
        },
    },{
        freezeTableName: true,
        timestamps: false
    })

}

