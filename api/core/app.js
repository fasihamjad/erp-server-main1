const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("../routes");
const compression = require("compression");
const { join } = require('path');

app.use(
	compression({
		level: 9,
		threshold: 100 * 1000,
	})
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('Uploads'));

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Custom-header");
	// in case we need to use our custom created header in application
	res.header("Access-Control-Expose-Headers", "X-Custom-header");
	next();
});

app.use("/v1/create", routes.Create);
app.use("/v1/update", routes.Update);
app.use("/v1/delete", routes.Delete);
app.use("/v1/getOne", routes.GetOne);
app.use("/v1/getAll", routes.GetAll);
app.use("/v1/login", routes.Login);
app.use("/v1/register", routes.Register);
app.use("/v1/admin_module", routes.Register);
app.use("/v1/upload", routes.Upload);
app.use("/", routes.Test);
module.exports = app;