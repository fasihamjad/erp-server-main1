const { sequelize } = require("../../config/database");
const { getCol, dataFilter } = require("../../utils/helper");
//Test commenet
exports.create = async (req, res) => {
	try {
		let { user_id, session_id } = req.user;
		const { active, email_address, is_ship_complete, is_hold, company_id } = req.body;
		let data = await dataFilter(req.body);
		active ? data.push(`row('active','true')`) : data.push(`row('active','false')`);
		is_hold ? data.push(`row('is_hold','true')`) : data.push(`row('is_hold','false')`);
		is_ship_complete ? data.push(`row('is_ship_complete','true')`) : data.push(`row('is_ship_complete','false')`);
		data.push(`row('created_by',${user_id})`);
		data.push(`row('created_date',current_timestamp)`);

		let customerCode = await sequelize.query(
			`SELECT COALESCE(MAX(CAST (CUSTOMER_CODE AS INTEGER)),0)+1 as customer_code FROM SCM_CUSTOMER WHERE COMPANY_ID=${company_id}`
		);
		data.push(`row('customer_code', ${customerCode[0][0].customer_code})`);

		// let { column_name, column_with_type } = await getCol("scm_customer", "customer_id", "N");
		// let query = await sequelize.query(`select ${column_name} from func_get_table_data('scm_customer','${column_name}','customer_id',2,'-1',${user_id},${session_id},1,0) as erptab (${column_with_type})  where email_address='${email_address}'`)

		// if (query[1].rowCount === 0) {
		let dataReponse = await sequelize.query(
			`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_customer',0, array[${data}]::typ_record[],1,'customer_id',1,1); commit;`
		);
		let customer_id = dataReponse[0][0].p_internal_id;
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_customer',${customer_id},1,'customer_id'); commit;`);
		res.status(200).json({ data: "Record Inserted !", customer_id });
		// }
		// else {
		//     res.status(200).json({ data: `Customer already exists with this Email: ${email_address}!` })
		// }
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getAll = async (req, res, from) => {
	let { user_id, session_id } = req.user;
	let { customer_code, region_id, customer_name, salePerson_id, customer_type_id, payment_term_id } = req.body;
	try {
		let query = await sequelize.query(
			`select * from func_get_customer_grid(${user_id},${session_id}, '${customer_code ? customer_code : null}', ${region_id ? region_id : null}, '${customer_name ? customer_name : null}', ${salePerson_id ? salePerson_id : null}, ${customer_type_id ? customer_type_id : null}, ${payment_term_id ? payment_term_id : null},null)`
		);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getOne = async (req, res) => {
	try {
		const id = req.params.Id;
		let { user_id, session_id } = req.user;
		let query = await sequelize.query(`select * from func_get_customer_grid(${user_id},${session_id},'null',null,'null',null,null,null,${id})`);
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
		let { user_id, session_id } = req.user;

		let id = req.params.Id;
		const { active, email_address } = req.body;
		let data = await dataFilter(req.body);
		active ? data.push(`row('active','true')`) : data.push(`row('active','false')`);

		let { column_name, column_with_type } = await getCol("scm_customer", "customer_id", "N");

		// let isExsist = await sequelize.query(
		// 	`select ${column_name} from func_get_table_data('scm_customer','${column_name}','customer_id',2,'${id}',${user_id},${session_id},1,0) as erptab (${column_with_type}) `
		// );
		// let isExsist = await sequelize.query(`select * from func_get_customer_grid('${id}',${user_id},${session_id},1,0))`);
		let isExsist = await sequelize.query(`select * from func_get_customer_grid(${user_id},${session_id},'null',null,'null',null,null,null,${id})`);

		if (isExsist[1].rowCount === 0) {
			res.status(404).json({ data: "No Customer Found !" });
		} else {
			dataReponse = await sequelize.query(
				`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'scm_customer',${id},array[${data}]::typ_record[],2,'customer_id',0,0); COMMIT;`
			);
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_customer',${id},2,'customer_id'); commit;`);
			res.status(200).json({ data: "Record Updated Successfully!" });
		}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.delete = async (req, res) => {
	try {
		let id = req.params.Id;
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(1,1,'scm_customer',${id},3,'customer_id'); commit;`);
		let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'scm_customer',${id}, null,3,'customer_id',0,0); commit;`);
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getCustomerTransaction = async (req, res) => {
	try {
		const { id } = req.body
		let { session_id, user_id } = req.user;
		let query = await sequelize.query(`select * from func_get_customer_related_transaction(${id}, ${user_id}, ${session_id})`);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};