const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		if (req.body.length > 0) {
			let note_id;
			const newData = req.body.map(({ item_code, ...rest }) => ({ ...rest }));
			for (let i = 0; i < req.body.length; i++) {
				note_id = newData[0].ship_header_id;
				let data = await boolFilter(newData[i]);
				data.push(`row('created_by',${user_id})`);
				data.push(`row('created_date',current_timestamp)`);
				data.push(`row('is_deleted',0)`);
				let dataResponse = await sequelize.query(
					`begin; call proc_erp_crud_operations(${user_id},${session_id},'ar_credit_note_lines',0, array[${data}]::typ_record[],1,'note_line_id',1,1); commit;`
				);
				let note_line_id = dataResponse[0][0].p_internal_id;
				let logQuery = await sequelize.query(
					`begin; call proc_generate_record_log(${user_id},${session_id},'ar_credit_note_lines',${note_line_id},1,'note_line_id'); commit;`
				);
			}
			let saveQuantity = await sequelize.query(
				`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${note_id},'CREDITNOTE'); commit;`
			);
		}
		res.status(200).json({ data: "Record Inserted !" });
		
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.update = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		let id = req.params.Id;
		const { dataLine } = req.body;
		const newData = dataLine.map(({ last_updated_by, last_updated_date, ...rest }) => ({ ...rest }));
		let creditId = newData[0].note_header_id;
		if (newData.length > 0) {
			for (let i = 0; i < newData.length; i++) {
				let data = await boolFilter(newData[i]);
				data.push(`row('last_updated_by',${user_id})`);
				data.push(`row('last_updated_date',current_timestamp)`);
				dataReponse = await sequelize.query(
					`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'ar_credit_note_lines',${newData[i].note_line_id},array[${data}]::typ_record[],2,'note_line_id',0,0); COMMIT;`
				);
				let logQuery = await sequelize.query(
					`begin; call proc_generate_record_log(${user_id},${session_id},'ar_credit_note_lines',${newData[i].note_line_id},2,'note_line_id'); commit;`
					);
				}
				let saveQuantity = await sequelize.query(
					`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${creditId},'CREDITNOTE'); commit;`
				);
		}
		let { column_name, column_with_type } = await getCol("ar_credit_note_lines", "note_line_id", "N");
		let data = await boolFilter(req.body);
		data.push(`row('last_updated_by',${user_id})`);
		data.push(`row('last_updated_date',current_timestamp)`);
		
		dataReponse = await sequelize.query(
			`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'ar_credit_note_lines',${id},array[${data}]::typ_record[],2,'note_line_id',0,0); COMMIT;`
		);
		let logQuery = await sequelize.query(
			`begin; call proc_generate_record_log(${user_id},${session_id},'ar_credit_note_lines',${id},2,'note_line_id'); commit;`
		);
		res.status(200).json({ data: "Record Updated Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getOne = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const id = req.params.Id;
		let query = await sequelize.query(`select * from func_get_item_receipt_lines_for_credit_note(${id},${user_id},${session_id}) `);
		if (!query[0][0]) return res.status(404).json({ data: "Record not found" });
		return res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getCreditLinesDetail = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const id = req.params.Id;
		let query = await sequelize.query(`select * from func_get_credit_note_lines_grid(${id},${user_id},${session_id}) `);
		if (!query[0][0]) return res.status(404).json({ data: "Record not found" });
		return res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
