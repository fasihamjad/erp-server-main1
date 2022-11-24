const { sequelize } = require("../../config/database");

exports.getAll = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { search_string } = req.body;
		let query = await sequelize.query(
			`select * from func_get_global_search_result('${search_string}',${user_id},${session_id})`);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};