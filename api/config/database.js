var Sequelize = require("sequelize");
const dotenv = require('dotenv');
dotenv.config();
exports.sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSERNAME, process.env.DBPASSWORD, {
    host: process.env.HOST,
    dialect: 'postgres',
    dialectOptions: {
        options: {
            encrypt: false
        }
    },
    logging: false
})

