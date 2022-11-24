const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		if (req.body.length > 0) {
			const newData = req.body.map(({ item_code, ...rest }) => ({ ...rest }));
			for (let i = 0; i < req.body.length; i++) {
				let data = await boolFilter(newData[i]);
				data.push(`row('created_by',${user_id})`);
				data.push(`row('created_date',current_timestamp)`);
				data.push(`row('is_deleted',0)`);
				let dataReponse = await sequelize.query(
					`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_purchase_bill_expense',0, array[${data}]::typ_record[],1,'bill_expense_id',1,1); commit;`
				);
				let bill_expense_id = dataReponse[0][0].p_internal_id;
				let logQuery = await sequelize.query(
					`begin; call proc_generate_record_log(${user_id},${session_id},'pay_purchase_bill_expense',${bill_expense_id},1,'bill_expense_id'); commit;`
				);
			}
		}
		res.status(200).json({ data: "Record Inserted !" });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getAll = async (req, res, from) => {
	try {
		const { user_id, session_id } = req.user;
		let query;
		let { column_name, column_with_type } = await getCol("pay_purchase_bill_expense", "bill_expense_id", "N");
		query = await sequelize.query(
			`select ${column_name} from func_get_table_data('pay_purchase_bill_expense','${column_name}','bill_expense_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `
		);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getAccountExpense = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { account_no, company_id } = req.body;
		let query = await sequelize.query(`select * from func_get_account_for_expense(${company_id},${user_id},${session_id},'N','${account_no}')`);
		let newRes = query[0].map((single) => {
			return {
				...single,
				quantity: 1,
			};
		});
		res.status(200).json(newRes);
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getOne = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;

		const id = req.params.Id;
		let newQuery = await sequelize.query(`select * from func_get_purchase_bill_expense_grid(${id}, ${user_id}, ${session_id})`);
		if (newQuery[1].rowCount === 0) {
			return res.status(404).json({ data: "No Record Found !" });
		} else {
			return res.status(200).json({ data: newQuery[0] });
		}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.update = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		let id = req.params.Id;
		const { dataLine } = req.body;
		const newData = dataLine.map(({ last_updated_by, last_updated_date, created_date, deleted_by, deleted_date, created_by, ...rest }) => ({ ...rest }));
		if (newData.length > 0) {
			for (let i = 0; i < newData.length; i++) {
				if (!newData[i].bill_item_id) {
					let data = await boolFilter(newData[i]);
					data.push(`row('created_by',${user_id})`);
					data.push(`row('created_date',current_timestamp)`);
					data.push(`row('is_deleted',0)`);
					let dataReponse = await sequelize.query(
						`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_purchase_bill_expense',0, array[${data}]::typ_record[],1,'bill_expense_id',1,1); commit;`
					);
					let bill_expense_id = dataReponse[0][0].p_internal_id;
					let logQuery = await sequelize.query(
						`begin; call proc_generate_record_log(${user_id},${session_id},'pay_purchase_bill_expense',${bill_expense_id},1,'bill_expense_id'); commit;`
					);
				}
			}
		}
		res.status(200).json({ data: "Record Updated Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
exports.delete = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		let id = req.params.Id;
		await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_purchase_bill_expense',${id}, null,3,'bill_expense_id',0,0); commit;`);
		await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_purchase_bill_expense',${id},3,'bill_expense_id'); commit;`);
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getSaleReturnLines = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const id = req.params.Id;
		// console.log("file: saleReturnLine.js ~ line 96 ~ id", id);
		let query = await sequelize.query(`select * from func_get_sale_invoice_line_for_return(${id},${user_id},${session_id}) `);
		if (!query[0][0]) return res.status(404).json({ data: "Record not found" });
		return res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).send(err.stack);
	}
};