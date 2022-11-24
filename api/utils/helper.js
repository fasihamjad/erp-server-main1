const { sequelize } = require("../config/database");
const multer = require("multer");
const jwt = require("jsonwebtoken");

module.exports.getCol = async (tableName, id, filter) => {
	let dataReponse = await sequelize.query(`call proc_get_table_column('${tableName}','${id}','${filter}','','1')`);
	let column_name = dataReponse[0][0].p_column_name;
	let column_with_type = dataReponse[0][0].p_column_with_type;
	return { column_name, column_with_type };
};

module.exports.dataFilter = async (body) => {
	let data = [];
	let newBody = Object.keys(body);
	let newVal = Object.values(body);
	for (let i = 0; i < newBody.length; i++) {
		if (typeof newVal[i] === "string") {
			if (newBody[i] === "product_date" || newBody[i] === "inactive_date" || newBody[i] === "opening_date") {
				data.push(`row('${newBody[i]}',current_timestamp)`);
			} else if (newBody[i] === "menu_id" || newBody[i] === "user_password") {
			} else {
				data.push(`row('${newBody[i]}','${newVal[i]}')`);
			}
		}
		if (typeof newVal[i] === "number") {
			data.push(`row('${newBody[i]}',${newVal[i]})`);
		}
	}
	return data;
};

module.exports.boolFilter = async (body) => {
	let data = [];
	let newBody = Object.keys(body);
	let newVal = Object.values(body);
	for (let i = 0; i < newBody.length; i++) {
		if (typeof newVal[i] === "string") {
			if (newBody[i] === "product_date" || newBody[i] === "inactive_date" || newBody[i] === "opening_date") {
				data.push(`row('${newBody[i]}',current_timestamp)`);
			} else if (newBody[i] === "menu_id" || newBody[i] === "user_password" || newBody[i] === "key") {
			} else {
				data.push(`row('${newBody[i]}','${newVal[i]}')`);
			}
		}
		if (typeof newVal[i] === "number") {
			data.push(`row('${newBody[i]}',${newVal[i]})`);
		}
		if (typeof newVal[i] === "boolean") {
			data.push(`row('${newBody[i]}','${newVal[i]}')`);
		}
	}
	return data;
};

module.exports.fileUploader = multer({
	limits: {
		fieldSize: 5000000,
		// storage: storage,
	},
	fileFilter(req, file, cb) {
		let regex = file.fieldname === "profilePicture" ? /\.(png|PNG|jpg|JPG|jpeg|JPEG)$/ : /\.(png|PNG)$/;
		if (!file.originalname.match(regex)) {
			return cb(new Error("Please upload valid File"));
		}
		cb(undefined, true);
	},
});

module.exports.authenticate = async (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token === null) return res.status(401).send("Invalid Token");
	jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
		if (err) {
			console.log("req: ", req.params);
			console.log("err !!", err.message);
			return res.status(401).send({ data: err.message });
		}
		req.user = user;
		next();
	});
};
