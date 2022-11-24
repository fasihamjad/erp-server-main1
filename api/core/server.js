const app = require("./app");
const environment = "development";
const configDB = require("../config/config");
const { Sequelize, DataTypes } = require("sequelize");

const db = configDB[environment];
const sequelize = new Sequelize(db.database, db.username, db.password, db);
app.listen(process.env.PORT, () => {
	sequelize
		.authenticate()
		.then(() => {
			console.log(`Server is running at ${process.env.PORT}`);
		})
		.catch((err) => {
			console.log("Error", err);
		});
});
