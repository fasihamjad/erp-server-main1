const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");
//abc
exports.create = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { company_id } = req.body;
		let data = await boolFilter(req.body);
		data.push(`row('created_by',${user_id})`);
		data.push(`row('created_date',current_timestamp)`);
		data.push(`row('is_deleted',0)`);
		let creditHeaderNo = await sequelize.query(
			`SELECT COALESCE(MAX(CAST (note_header_no as integer)),0)+1 as note_header_no from ar_credit_note_header where company_id=${company_id}`
		);
		data.push(`row('note_header_no',${creditHeaderNo[0][0].note_header_no})`);
		let dataReponse = await sequelize.query(
			`begin; call proc_erp_crud_operations(${user_id},${session_id},'ar_credit_note_header',0, array[${data}]::typ_record[],1,'note_header_id',1,1); commit;`
		);
		let note_header_id = dataReponse[0][0].p_internal_id;
		let logQuery = await sequelize.query(
			`begin; call proc_generate_record_log(${user_id},${session_id},'ar_credit_note_header',${note_header_id},1,'note_header_id'); commit;`
		);
		res.status(200).json({ data: "Record Inserted !", note_header_id });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getAll = async (req, res, from) => {
	
	try {
		const { user_id, session_id } = req.user;
		const { startDate, endDate } = req.body;
		if (new Date(startDate) > new Date(endDate)) return res.status(400).json({ data: "Start date cannot be greater than End date" });
		let query = await sequelize.query(
			`select * from func_get_credit_note_grid(null,'${startDate}','${endDate}',${user_id},${session_id}) order by note_header_id  desc`
		);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

//Coming From Grid
exports.getOne = async (req, res) => {

	try {
		const { user_id, session_id } = req.user;

		const id = req.params.Id;
		// let { column_name, column_with_type } = await getCol("ar_credit_note_header", "note_header_id", "N")
		// let query = await sequelize.query(`select ${column_name} from func_get_table_data('ar_credit_note_header','${column_name}','note_header_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED' ) as erptab (${column_with_type}) `)
		// func_get_item_receipt_grid(
		//     p_note_header_id integer,
		//     p_from_date date,
		//     p_to_date date,
		//     p_user_id integer,
		//     p_session_id integer)

		//		func_get_credit_note_grid
		//func_get_item_receipt_for_credit_note
		let query = await sequelize.query(`select * from func_get_item_receipt_for_credit_note(${id},${user_id},${session_id})`);
		if (query[1].rowCount === 0) {
		
			return res.status(404).json({ data: "No Record Found !" });
		} else {
			return res.status(200).json({ data: query[0] });
		}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.update = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		let id = req.params.Id;
		let { column_name, column_with_type } = await getCol("ar_credit_note_header", "note_header_id", "N");
		let data = await boolFilter(req.body);
		data.push(`row('last_updated_by',${user_id})`);
		data.push(`row('last_updated_date',current_timestamp)`);
		let isExsist = await sequelize.query(
			`select ${column_name} from func_get_table_data('ar_credit_note_header','${column_name}','note_header_id',2,'${id}',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `
		);
		if (isExsist[1].rowCount === 0) {
			res.status(404).json({ data: "No Record Found!" });
		} else {
			dataReponse = await sequelize.query(
				`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'ar_credit_note_header',${id},array[${data}]::typ_record[],2,'note_header_id',0,0); COMMIT;`
			);
			let logQuery = await sequelize.query(
				`begin; call proc_generate_record_log(${user_id},${session_id},'ar_credit_note_header',${id},2,'note_header_id'); commit;`
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
			`begin; call proc_erp_crud_operations(${user_id},${session_id},'ar_credit_note_header',${id}, null,3,'note_header_id',0,0); commit;`
		);
		let dataReponse1 = await sequelize.query(
			`begin; call proc_erp_crud_operations(${user_id},${session_id},'ar_credit_note_lines',${id}, null,3,'note_header_id',0,0); commit;`
		);
		let saveQuantity = await sequelize.query(
			`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'CREDITNOTE'); commit;`
		);
		let logQuery = await sequelize.query(
			`begin; call proc_generate_record_log(${user_id},${session_id},'ar_credit_note_header',${id},3,'note_header_id'); commit;`
		);
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getCreditHeaderDetail = async (req, res) => {
	console.log('abc')
	try {
		const { user_id, session_id } = req.user;
		const id = req.params.Id;
		let query = await sequelize.query(`select * from func_get_credit_note_grid(${id},null,null,${user_id},${session_id}) `);
		if (!query[0][0]) return res.status(404).json({ data: "Record not found" });
		return res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
