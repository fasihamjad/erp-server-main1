const { sequelize } = require("../../../config/database");
const { getCol, dataFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
	try {
		const { is_active } = req.body;
		let data = await dataFilter(req.body);
		is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
		data.push(`row('created_by',1)`);
		data.push(`row('created_date',current_timestamp)`);
		data.push(`row('is_deleted',0)`);
		let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'scm_term',0, array[${data}]::typ_record[],1,'term_id',1,1); commit;`);
		let term_id = dataReponse[0][0].p_internal_id;
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(1,1,'scm_term',${term_id},1,'term_id'); commit;`);
		res.status(200).json({ data: "Record Inserted !", term_id });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getAll = async (req, res, from) => {
	try {
		const { user_id, session_id } = req.user;
		let query;
		if (from === "saleOrder") {
			let sqleuery = "";
			sqleuery += " select term_id,term_name,is_active,factor_id from scm_term st ";
			sqleuery += "  where st.is_deleted=0 and st.is_Active=true  ";
			query = await sequelize.query(sqleuery);
			return query[0];
		} else {
			let { column_name, column_with_type } = await getCol("scm_term", "term_id", "N");
			query = await sequelize.query(
				`select ${column_name} from func_get_table_data('scm_term','${column_name}','term_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `
			);
			res.status(200).send({ data: query[0] });
		}
	} catch (err) {
		res.status(400).json(err.stack);
	}
};
exports.getOne = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const id = req.params.Id;
		let { column_name, column_with_type } = await getCol("scm_term", "term_id", "N");
		let query = await sequelize.query(
			`select *  from func_get_table_data('scm_term','${column_name}','term_id',2,'${id}',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `
		);
		if (query[1].rowCount === 0) {
			res.status(404).json({ data: "No Record Found !" });
		} else {
			res.status(200).json({ data: query[0] });
		}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.update = async (req, res) => {
	try {
		let id = req.params.Id;
		const { is_active } = req.body;
		let { column_name, column_with_type } = await getCol("scm_term", "term_id", "N");
		let data = await dataFilter(req.body);
		is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
		data.push(`row('last_updated_by',1)`);
		data.push(`row('last_updated_date',current_timestamp)`);

		let isExsist = await sequelize.query(
			`select ${column_name} from func_get_table_data('scm_term','${column_name}','term_id',2,'${id}',1,0) as erptab (${column_with_type}) `
		);
		if (isExsist[1].rowCount === 0) {
			res.status(404).json({ data: "No Customer Found !" });
		} else {
			dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'scm_term',${id},array[${data}]::typ_record[],2,'term_id',0,0); COMMIT;`);
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(1,1,'scm_term',${id},2,'term_id'); commit;`);
			res.status(200).json({ data: "Record Updated Successfully!" });
		}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.delete = async (req, res) => {
	try {
		let id = req.params.Id;
		let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'scm_term',${id}, null,3,'term_id',0,0); commit;`);
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(1,1,'scm_term',${id},3,'term_id'); commit;`);
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};