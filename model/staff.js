
const bcrypt = require("bcryptjs");
const Sequelize = require("sequelize");

var Staff = module.exports = function(sequelize,DataType) {


    return sequelize.define("staff", {
        staff_id: {
            type: DataType.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataType.STRING
        },
        username: {
            type: DataType.STRING
        },
        password: {
            type: DataType.STRING
        },
        role: {
            type: DataType.INTEGER.UNSIGNED
        }
    }, {
        freezeTableName: true,
        timestamps: false,
        classMethods: {

            comparePassword: function (password, hash, callback) {

                bcrypt.compare(password, hash, function (err, isMatch) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        callback(null, isMatch);
                    }
                });
            }
        }

    })

}
module.exports.getUserByUsername = function(username, callback){
    var query = {where:{username: username}};
    Staff.findAll(query, callback);
}
    module.exports.createUser = function(newUser, callback){
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                newUser.password = hash;
                newUser.create(callback);
            });
        });
    }

module.exports.getUserById = function(id, callback){
    Staff.findByPk(id, callback);
}



