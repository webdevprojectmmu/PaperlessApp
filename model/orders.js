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
        created_at: {
            type: DataType.DATE(3),
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP(3)'),
        },
        updated_at: {
            type: DataType.DATE(3),
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'),
        },
    },{
        freezeTableName: true,
        timestamps: false
    })

}

