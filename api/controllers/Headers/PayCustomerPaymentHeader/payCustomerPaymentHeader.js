const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");
const getShipVia = require("../../Admin/AdminCourierService/adminCourierService");
const getVendor = require("../../SCMVendor/scmVendor");

exports.create = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { company_id } = req.body;
		let data = await boolFilter(req.body);
		data.push(`row('created_by',${user_id})`);
		data.push(`row('created_date',current_timestamp)`);
		data.push(`row('is_deleted',0)`);
		let paymentHeaderNo = await sequelize.query(`SELECT COALESCE(MAX(CAST (payment_header_no as integer)),0)+1 as payment_header_no from pay_customer_payment_header where company_id=${company_id}`);
		data.push(`row('payment_header_no',${paymentHeaderNo[0][0].payment_header_no})`);
		let dataReponse = await sequelize.query(
			`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_customer_payment_header',0, array[${data}]::typ_record[],1,'payment_header_id',1,1); commit;`
		);
		let payment_header_id = dataReponse[0][0].p_internal_id;
		let payment_header_no = paymentHeaderNo[0][0].payment_header_no;
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_customer_payment_header',${payment_header_id},1,'payment_header_id'); commit;`);
		
		let saveQuantity = await sequelize.query(
			`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${payment_header_id},'CUSTOMERPAYMENT'); commit;`
		  );


		res.status(200).json({ data: "Record Inserted !", payment_header_id, payment_header_no });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getAll = async (req, res, from) => {
	try {
		const { user_id, session_id } = req.user;
		const { startDate, endDate } = req.body;

		if (new Date(startDate) > new Date(endDate)) return res.status(400).json({ data: "Start date cannot be greater than End date" });
		let query = await sequelize.query(`select * from func_get_customer_payment_grid(null,'${startDate}','${endDate}',${user_id},${session_id}) order by payment_header_id desc`);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

// //Coming From Grid
exports.getOne = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const id = req.params.Id;
		let query = await sequelize.query(`select * from func_get_customer_payment_grid(${id},null,null,${user_id},${session_id})`);
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
		let { column_name, column_with_type } = await getCol("pay_customer_payment_header", "payment_header_id", "N");
		let data = await boolFilter(req.body);
		data.push(`row('last_updated_by',${user_id})`);
		data.push(`row('last_updated_date',current_timestamp)`);
		let isExsist = await sequelize.query(
			`select ${column_name} from func_get_table_data('pay_customer_payment_header','${column_name}','payment_header_id',2,'${id}',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `
		);
		if (isExsist[1].rowCount === 0) {
			res.status(404).json({ data: "No Record Found!" });
		} else {
			dataReponse = await sequelize.query(
				`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'pay_customer_payment_header',${id},array[${data}]::typ_record[],2,'payment_header_id',0,0); COMMIT;`
			);
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_customer_payment_header',${id},2,'payment_header_id'); commit;`);
			res.status(200).json({ data: "Record Updated Successfully!" });

			let saveQuantity = await sequelize.query(
				`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'CUSTOMERPAYMENT'); commit;`
			  );
		}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.delete = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		let id = req.params.Id;
		let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_customer_payment_header',${id}, null,3,'payment_header_id',0,0); commit;`);
		// let dataReponse1 = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_customer_payment_item',${id}, null,3,'payment_header_id',0,0); commit;`);
		// let dataReponse2 = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_customer_payment_expense',${id}, null,3,'payment_header_id',0,0); commit;`);
		let saveQuantity = await sequelize.query(`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'CUSTOMERPAYMENT'); commit;`);
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_customer_payment_header',${id},3,'payment_header_id'); commit;`);
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

// exports.getCreditHeaderDetail = async (req, res) => {
// 	try {
// 		const { user_id, session_id } = req.user;
// 		const id = req.params.Id;
// 		let query = await sequelize.query(`select * from func_get_credit_note_grid(${id},null,null,${user_id},${session_id}) `);
// 		if (!query[0][0]) return res.status(404).json({ data: "Record not found" });
// 		return res.status(200).json(query[0]);
// 	} catch (err) {
// 		res.status(400).send(err.stack);
// 	}
// };

// exports.formData = async (req, res) => {
// 	try {
// 		let from = "saleOrder";
// 		let shipVia = await getShipVia.getAll(req, res, from);
// 		let VendorDetail = await getVendor.getAll(req, res, "adminMenu");
// 		let vendor = VendorDetail?.map((item) => {
// 			return {
// 				vendor_id: item.vendor_id,
// 				vendor_code: item.vendor_code,
// 				vendor_name: item.vendor_name,
// 			};
// 		});
// 		res.status(200).json({
// 			shipVia,
// 			vendor,
// 		});
// 	} catch (err) {
// 		res.status(400).json(err.stack);
// 	}
// };
