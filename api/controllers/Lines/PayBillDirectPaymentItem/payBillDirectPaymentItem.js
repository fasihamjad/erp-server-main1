const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
	try {
		let dataReponse;
		const { user_id, session_id } = req.user;
		if (req.body.data.length > 0) {

			const newData = req.body.data.map(({ item_code, ...rest }) => ({ ...rest }));
			for (let i = 0; i < req.body.data.length; i++) {
				let data = await boolFilter(newData[i]);
				data.push(`row('created_by',${user_id})`);
				data.push(`row('created_date',current_timestamp)`);
				data.push(`row('is_deleted',0)`);
				dataReponse = await sequelize.query(
					`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_bill_direct_payment_item',0, array[${data}]::typ_record[],1,'direct_payment_item_id',1,1); commit;`
				);
				let direct_payment_item_id = dataReponse[0][0].p_internal_id;
				let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_bill_direct_payment_item',${direct_payment_item_id},1,'direct_payment_item_id'); commit;`);
			}
		}
		res.status(200).json({ data: "Record Inserted !", direct_payment_item_id: dataReponse[0][0].p_internal_id });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};
exports.getAll = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		console.log(req.body);
		let query;
		let { column_name, column_with_type } = await getCol("pay_bill_direct_payment_item", "direct_payment_item_id", "N");
		query = await sequelize.query(
			`select * from func_get_pay_bill_direct_payment_item_grid(${req.body.direct_payment_header_id},${user_id},${session_id}) as erptab `
		);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};
exports.getOne = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const id = req.params.Id;
		let newQuery = await sequelize.query(
			`select * from func_get_pay_bill_direct_payment_item_grid(${id}, ${user_id}, ${session_id})`
		);
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
		let paymentHeaderId = req.params.Id;
		if (req.body.dataLine.length > 0) {
			const newData = req.body.dataLine.map(({ item_code, ...rest }) => ({ ...rest }));
			for (let i = 0; i < req.body.dataLine.length; i++) {
				if (!newData[i].direct_payment_item_id) {
					let data = await boolFilter(newData[i]);
					data.push(`row('created_by',${user_id})`);
					data.push(`row('created_date',current_timestamp)`);
					data.push(`row('direct_payment_header_id',${paymentHeaderId})`);
					data.push(`row('is_deleted',0)`);
					let dataReponse = await sequelize.query(
						`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_bill_direct_payment_item',0, array[${data}]::typ_record[],1,'direct_payment_item_id',1,1); commit;`
					);
					let direct_payment_item_id = dataReponse[0][0].p_internal_id;
					let logQuery = await sequelize.query(
						`begin; call proc_generate_record_log(${user_id},${session_id},'pay_bill_direct_payment_item',${direct_payment_item_id},1,'direct_payment_item_id'); commit;`
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
		let dataReponse = await sequelize.query(
			`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_bill_direct_payment_item',${id}, null,3,'direct_payment_item_id',0,0); commit;`
		);
		let logQuery = await sequelize.query(
			`begin; call proc_generate_record_log(${user_id},${session_id},'pay_bill_direct_payment_item',${id},3,'direct_payment_item_id'); commit;`
		);
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
