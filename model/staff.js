
module.exports = function(sequelize,DataType) {

    return sequelize.define("staff",{
    staff_id: {
        type: DataType.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    name:{
        type: DataType.STRING
    },
    username:{
        type: DataType.STRING
    },
    password:{
        type: DataType.STRING
    },
    role: {
        type: DataType.INTEGER.UNSIGNED
    }
},{
        freezeTableName: true,
        timestamps: false
    })

}