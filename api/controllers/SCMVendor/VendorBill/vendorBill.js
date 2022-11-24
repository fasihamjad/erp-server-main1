const { sequelize } = require("../../../config/database");
const { getCol, dataFilter, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { is_active, is_default, vendors } = req.body;
		let { column_name, column_with_type } = await getCol("scm_vendor_bill_to", "vendor_id", "N");
		if (vendors) {
			for (let i = 0; i < vendors.length; i++) {
				let com = Object.keys(vendors[i]);	
				for (let j = 0; j < com.length; j++) {
					if (!column_name.includes(com[j])) return res.status(400).send({ data: "something went wrong" });
				}
				let newData = await boolFilter(vendors[i]);
				let dataReponse = await sequelize.query(
					`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_vendor_bill_to',0, array[${newData}]::typ_record[],1,'vendor_id',1,1); commit;`
				);
				let vendor_id = dataReponse[0][0].p_internal_id;
				let logQuery = await sequelize.query(
					`begin; call proc_generate_record_log(${user_id},${session_id},'scm_vendor_bill_to',${vendor_id},1,'vendor_id'); commit;`
				);
			}
			return res.status(200).json({ data: "vendors Bill Added !" });
		}

		if (!vendors) {
			let data = await dataFilter(req.body);
			is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
			is_default ? data.push(`row('is_default','true')`) : data.push(`row('is_default','false')`);
			data.push(`row('created_by',${user_id})`);
			data.push(`row('created_date',current_timestamp)`);
			let dataReponse = await sequelize.query(
				`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_vendor_bill_to',0, array[${data}]::typ_record[],1,'vendor_id',1,1); commit;`
			);
			let vendor_id = dataReponse[0][0].p_internal_id;
			let logQuery = await sequelize.query(
				`begin; call proc_generate_record_log(${user_id},${session_id},'scm_vendor_bill_to',${vendor_id},1,'vendor_id'); commit;`
			);
			return res.status(200).json({ data: "Record Inserted !", p_internal_id: dataReponse[0] });
		}
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getAll = async (req, res, from) => {
	try {
		const { user_id, session_id } = req.user;
		let { column_name, column_with_type } = await getCol("scm_vendor_bill_to", "vendor_bill_to_id", "N");
		let query = await sequelize.query(
			`select ${column_name} from func_get_table_data('scm_vendor_bill_to','${column_name}','vendor_bill_to_id',2,'-1',${user_id},${session_id},1,0,'GET_SETUP_DATA_DETAIL') as erptab (${column_with_type}) `
		);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getOne = async (req, res) => {
	try {
		const id = req.params.Id;
		const { user_id, session_id } = req.user;
		let { column_name, column_with_type } = await getCol("scm_vendor_bill_to", "vendor_bill_to_id", "Y");
		let query = await sequelize.query(
			`select *  from func_get_table_data('scm_vendor_bill_to','${column_name}','vendor_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED' )  as erptab (${column_with_type}) `
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
		const { is_active, is_default } = req.body;
		let { column_name, column_with_type } = await getCol("scm_vendor_bill_to", "vendor_bill_to_id", "N");
		let data = await dataFilter(req.body);
		is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
		is_default ? data.push(`row('is_default','true')`) : data.push(`row('is_default','false')`);
		data.push(`row('last_updated_by',${user_id})`);
		data.push(`row('last_updated_date',current_timestamp)`);

		let isExsist = await sequelize.query(
			`select ${column_name} from func_get_table_data('scm_vendor_bill_to','${column_name}','vendor_bill_to_id',2,'${id}',1,0) as erptab (${column_with_type}) `
		);
		if (isExsist[1].rowCount === 0) {
			res.status(404).json({ data: "No Customer Found !" });
		} else {
			dataReponse = await sequelize.query(
				`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'scm_vendor_bill_to',${id},array[${data}]::typ_record[],2,'vendor_bill_to_id',0,0); COMMIT;`
			);
			let logQuery = await sequelize.query(
				`begin; call proc_generate_record_log(${user_id},${session_id},'scm_vendor_bill_to',${id},2,'vendor_bill_to_id'); commit;`
			);
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
		let dataReponse = await sequelize.query(
			`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_vendor_bill_to',${id}, null,3,'vendor_bill_to_id',0,0); commit;`
		);
		let logQuery = await sequelize.query(
			`begin; call proc_generate_record_log(${user_id},${session_id},'scm_vendor_bill_to',${id},3,'vendor_bill_to_id'); commit;`
		);
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getOneBill = async (req, res) => {
	try {
		const id = req.params.Id;
		const { user_id, session_id } = req.user;
		let { column_name, column_with_type } = await getCol("scm_vendor_bill_to", "vendor_bill_to_id", "Y");
		let query = await sequelize.query(
			`select *  from func_get_table_data('scm_vendor_bill_to','${column_name}','vendor_bill_to_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED' )  as erptab (${column_with_type}) `
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