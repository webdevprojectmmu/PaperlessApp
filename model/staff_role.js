
module.exports = function(sequelize,DataType) {

    return sequelize.define("staff_role", {
        role_id: {
            type: DataType.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        role_name: {
            type: DataType.STRING
        }
    },{
        freezeTableName: true,
        timestamps: false
    })

}