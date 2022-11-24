const { sequelize } = require("../../config/database");
const { getCol, boolFilter } = require("../../utils/helper");

exports.create = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { company_id } = req.body;
		let boolData = await boolFilter(req.body);
		boolData.push(`row('created_by',${user_id})`);
		boolData.push(`row('created_date',current_timestamp)`);
		boolData.push(`row('is_deleted',0)`);
		let vendorCode = await sequelize.query(`SELECT COALESCE(MAX(CAST (VENDOR_CODE AS INTEGER)),0)+1 as vendor_code FROM scm_vendor WHERE COMPANY_ID=${company_id}`);
		boolData.push(`row('vendor_code', ${vendorCode[0][0].vendor_code})`);
		let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id}, 'scm_vendor',0, array[${boolData}]::typ_record[],1,'vendor_id',1,1); commit;`);
		let vendor_id = dataReponse[0][0].p_internal_id;
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_vendor',${vendor_id},1,'vendor_id'); commit;`);
		return res.status(200).json({ data: "Record Inserted !", vendor_id });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};
exports.getAll = async (req, res, from) => {
	try {
		const { user_id, session_id } = req.user;
		let { column_name, column_with_type } = await getCol("scm_vendor", "vendor_id", "N");
		let query = await sequelize.query(
			`select ${column_name} from func_get_table_data('scm_vendor','${column_name}','vendor_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) order by vendor_name asc`
		);
		if (from === "adminMenu") {
			return query[0];
		} else {
			return res.status(200).send({ data: query[0] });
		}
	} catch (err) {
		res.status(400).json(err.stack);
	}
};
exports.getOne = async (req, res) => {
	try {
		const id = req.params.Id;
		const { user_id, session_id } = req.user;
		let { column_name, column_with_type } = await getCol("scm_vendor", "vendor_id", "N");
		let query = await sequelize.query(
			`select *  from func_get_table_data('scm_vendor','${column_name}','vendor_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED')  as erptab (${column_with_type})`
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
		const { user_id, session_id } = req.user;
		let { column_name, column_with_type } = await getCol("scm_vendor", "vendor_id", "N");
		let boolData = await boolFilter(req.body);
		boolData.push(`row('last_updated_by',${user_id})`);
		boolData.push(`row('last_updated_date',current_timestamp)`);

		let isExsist = await sequelize.query(
			`select ${column_name} from func_get_table_data('scm_vendor','${column_name}','vendor_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED' ) as erptab (${column_with_type}) `
		);
		if (isExsist[1].rowCount === 0) {
			res.status(404).json({ data: "No Record Found!" });
		} else {
			dataReponse = await sequelize.query(
				`BEGIN; call proc_erp_crud_operations(${user_id}, ${session_id},'scm_vendor',${id},array[${boolData}]::typ_record[],2,'vendor_id',0,0); COMMIT;`
			);
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id}, ${session_id},'scm_vendor',${id},2,'vendor_id'); commit;`);
			res.status(200).json({ data: "Record Updated Successfully!" });
		}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
exports.delete = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		let id = req.params.Id;
		let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_vendor',${id}, null,3,'vendor_id',0,0); commit;`);
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_vendor',${id},3,'vendor_id'); commit;`);
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
