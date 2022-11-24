
var Sequelize = require("sequelize");
const dotenv = require('dotenv');
dotenv.config();
var sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSERNAME, process.env.DBPASSWORD, {
    host: process.env.HOST,
    dialect: 'postgres',
    dialectOptions: {
        options: {
            encrypt: false
        }
    },
    logging: false
})


exports.getAll = async (req, res) => {
    try {
        await sequelize.authenticate();
        // console.log(sequelize.authenticate());
  res.status(200).send("hello")
    }
    catch (err) {
        res.status(400).send(err.stack)
        console.error('Unable to connect to the database:', error);
    }
};