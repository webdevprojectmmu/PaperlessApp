const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://'+process.env.DBNAME+':'+process.env.PASSWORD+'@'+process.env.URL+':'+process.env.PORT+'/'+process.env.DATABASE+'');
// pass your sequelize config here

const FirstModel = require("./order_item");


const models = {
    First: FirstModel.init(sequelize, Sequelize),
};

// Run `.associate` if it exists,
// ie create relationships in the ORM
Object.values(models)
    .filter(model => typeof model.associate === "function")
    .forEach(model => model.associate(models));

const db = {
    ...models,
    sequelize
};

module.exports = db;