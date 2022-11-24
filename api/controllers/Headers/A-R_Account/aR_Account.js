const { sequelize } = require("../../../config/database");

exports.getAll = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		let query = await sequelize.query(`select * from func_get_account_for_cust_payment(${user_id},${session_id}) order by account_name asc`);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};
