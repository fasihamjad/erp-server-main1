const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		if (req.body.length > 0) {
			const newData = req.body.map(({ item_code, ...rest }) => ({ ...rest }));
			let receipt_id = newData[0].receipt_header_id;
			for (let i = 0; i < req.body.length; i++) {
				let data = await boolFilter(newData[i]);
				data.push(`row('created_by',${user_id})`);
				data.push(`row('created_date',current_timestamp)`);
				data.push(`row('is_deleted',0)`);
				let dataReponse = await sequelize.query(
					`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_item_receipt_lines',0, array[${data}]::typ_record[],1,'receipt_line_id',1,1); commit;`
				);
				let receipt_line_id = dataReponse[0][0].p_internal_id;
				let saveQuantity = await sequelize.query(
					`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${receipt_id},'ITEMRECEIPT'); commit;`
				);
				let logQuery = await sequelize.query(
					`begin; call proc_generate_record_log(${user_id},${session_id},'scm_item_receipt_lines',${receipt_line_id},1,'receipt_line_id'); commit;`
				);
			}
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
		// const { is_active } = req.body;
		const { dataLine } = req.body;
		const newData = dataLine.map(({ last_updated_by, last_updated_date, ...rest }) => ({ ...rest }));
		let receiptId = newData[0].receipt_header_id;

		if (newData.length > 0) {
			for (let i = 0; i < newData.length; i++) {
				let data = await boolFilter(newData[i]);
				data.push(`row('last_updated_by',${user_id})`);
				data.push(`row('last_updated_date',current_timestamp)`);
				dataReponse = await sequelize.query(
					`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'scm_item_receipt_lines',${newData[i].receipt_line_id},array[${data}]::typ_record[],2,'receipt_line_id',0,0); COMMIT;`
				);
				let saveQuantity = await sequelize.query(
					`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${receiptId},'ITEMRECEIPT'); commit;`
				);
				let logQuery = await sequelize.query(
					`begin; call proc_generate_record_log(${user_id},${session_id},'scm_item_receipt_lines',${newData[i].receipt_line_id},2,'receipt_line_id'); commit;`
				);
			}
		}
		let { column_name, column_with_type } = await getCol("scm_item_receipt_lines", "receipt_line_id", "N");
		let data = await boolFilter(req.body);
		data.push(`row('last_updated_by',${user_id})`);
		data.push(`row('last_updated_date',current_timestamp)`);
		// let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('scm_item_receipt_lines','${column_name}','receipt_line_id',2,'${id}',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
		// if (isExsist[1].rowCount === 0) {
		//     res.status(404).json({ data: "No Record Found!" })
		// }
		// else {
		dataReponse = await sequelize.query(
			`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'scm_item_receipt_lines',${id},array[${data}]::typ_record[],2,'receipt_line_id',0,0); COMMIT;`
		);
		// let saveQuantity = await sequelize.query(`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${receiptId},'SALERETURN'); commit;`)
		let logQuery = await sequelize.query(
			`begin; call proc_generate_record_log(${user_id},${session_id},'scm_item_receipt_lines',${id},2,'receipt_line_id'); commit;`
		);
		res.status(200).json({ data: "Record Updated Successfully!" });
		//}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getReceiptLines = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const id = req.params.Id;
		let query = await sequelize.query(`select * from func_get_sale_return_line_for_item_receipt(${id},${user_id},${session_id}) `);
		if (!query[0][0]) return res.status(404).json({ data: "Record not found" });
		return res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getReceiptLinesDetail = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const id = req.params.Id;
		let query = await sequelize.query(`select * from func_get_item_receipt_lines_grid(${id},${user_id},${session_id}) `);
		if (!query[0][0]) return res.status(404).json({ data: "Record not found" });
		return res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).send(err.stack);
	}
};