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
		let billHeaderNo = await sequelize.query(`SELECT COALESCE(MAX(CAST (bill_header_no as integer)),0)+1 as bill_header_no from pay_purchase_bill_header where company_id=${company_id}`);
		data.push(`row('bill_header_no',${billHeaderNo[0][0].bill_header_no})`);
		let dataReponse = await sequelize.query(
			`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_purchase_bill_header',0, array[${data}]::typ_record[],1,'bill_header_id',1,1); commit;`
		);
		let bill_header_id = dataReponse[0][0].p_internal_id;
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_purchase_bill_header',${bill_header_id},1,'bill_header_id'); commit;`);
		
		let saveQuantity = await sequelize.query(
			`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${bill_header_id},'PURCHASEBILL'); commit;`
		  );

		res.status(200).json({ data: "Record Inserted !", bill_header_id });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getAll = async (req, res, from) => {
	try {
		const { user_id, session_id } = req.user;
		const { startDate, endDate } = req.body;
		if (new Date(startDate) > new Date(endDate)) return res.status(400).json({ data: "Start date cannot be greater than End date" });
		let query = await sequelize.query(`select * from func_get_purchase_bill_grid(null,'${startDate}','${endDate}',${user_id},${session_id}) order by bill_header_id desc`);
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
		let query = await sequelize.query(`select * from func_get_purchase_bill_grid(${id},null,null,${user_id},${session_id})`);
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
		let { column_name, column_with_type } = await getCol("pay_purchase_bill_header", "bill_header_id", "N");
		let data = await boolFilter(req.body);
		data.push(`row('last_updated_by',${user_id})`);
		data.push(`row('last_updated_date',current_timestamp)`);
		let isExsist = await sequelize.query(
			`select ${column_name} from func_get_table_data('pay_purchase_bill_header','${column_name}','bill_header_id',2,'${id}',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `
		);
		if (isExsist[1].rowCount === 0) {
			res.status(404).json({ data: "No Record Found!" });
		} else {
			dataReponse = await sequelize.query(
				`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'pay_purchase_bill_header',${id},array[${data}]::typ_record[],2,'bill_header_id',0,0); COMMIT;`
			);
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_purchase_bill_header',${id},2,'bill_header_id'); commit;`);
			
			let saveQuantity = await sequelize.query(
				`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'PURCHASEBILL'); commit;`
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
		let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_purchase_bill_header',${id}, null,3,'bill_header_id',0,0); commit;`);
		let dataReponse1 = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_purchase_bill_item',${id}, null,3,'bill_header_id',0,0); commit;`);
		let dataReponse2 = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_purchase_bill_expense',${id}, null,3,'bill_header_id',0,0); commit;`);
		// let saveQuantity = await sequelize.query(`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'CREDITNOTE'); commit;`);
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_purchase_bill_header',${id},3,'bill_header_id'); commit;`);
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getCreditHeaderDetail = async (req, res) => {
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

exports.formData = async (req, res) => {
	try {
		let from = "saleOrder";
		let shipVia = await getShipVia.getAll(req, res, from);
		let VendorDetail = await getVendor.getAll(req, res, "adminMenu");
		let vendor = VendorDetail?.map((item) => {
			return {
				vendor_id: item.vendor_id,
				vendor_code: item.vendor_code,
				vendor_name: item.vendor_name,
			};
		});
		res.status(200).json({
			shipVia,
			vendor,
		});
	} catch (err) {
		res.status(400).json(err.stack);
	}
};


exports.payVendorBillForPayment = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { vendor_id } = req.body;
  
        let query = await sequelize.query(
        `select * from func_get_pay_vendor_bill_for_payment(${vendor_id},${user_id},${session_id})`
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };