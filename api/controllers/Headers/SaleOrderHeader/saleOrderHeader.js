const { sequelize } = require("../../../config/database");
const { getCol, dataFilter } = require("../../../utils/helper");
const getGender = require("../../Gender/gender");
const getAdminLocation = require("../../Admin/AdminLocation/adminLocation");
const getOrderStatus = require("../../OrderStatus/orderStatus");
const getAdminRegion = require("../../Admin/AdminRegion/adminRegion");
const getSalesPerson = require("../../SalesPerson/salesPerson");
const getFreightTest = require("../../Admin/AdminFreightTerm/adminFreightTerm");
const getBerganBilling = require("../../Admin/AdminBerganBilling/adminBerganBilling");
const getCustomerTerm = require("../../Customer/CustomerTerm/customerTerm");
const getShipVia = require("../../Admin/AdminCourierService/adminCourierService");
const getAdminShippingMethod = require("../../Admin/AdminShippingMethod/adminShippingMethod");
const getAdminShipTaxCode = require("../../Admin/AdminShipTaxCode/adminShipTaxCode");
const getAdminDiscount = require("../../Admin/AdminDiscount/adminDiscount");
const getAdminFactor = require("../../Admin/AdminFactor/adminFactor");
const getTermForPrint = require("../../Customer/CustomerTermForPrint/customerTermForPrint");
const getAdminBerganPaymentTerm = require("../../Admin/AdminBerganPaymentTerm/adminBerganPaymentTerm");
var numeral = require("numeral");

exports.create = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { is_closed, is_ship_complete, start_date, end_date, cancel_date, randomData, company_id } = req.body;
		if (new Date(end_date) < new Date(start_date)) return res.status(400).json({ data: "End date cannot be lesser than Start date" });
		if (new Date(cancel_date) < new Date(start_date)) return res.status(400).json({ data: "Cancel date cannot be lesser than Start date" });
		let data = await dataFilter(req.body);
		data.push(`row('created_by',${user_id})`);
		data.push(`row('created_date',current_timestamp)`);
		data.push(`row('is_deleted',0)`);
		is_closed ? data.push(`row('is_closed','true')`) : data.push(`row('is_closed','false')`);
		is_closed && data.push(`row('closed_date',current_timestamp)`);
		is_ship_complete ? data.push(`row('is_ship_complete','true')`) : data.push(`row('is_ship_complete','false')`);
		// console.log("data", data)
		// console.log("arr", randomData)
		let orderheaderno= await sequelize.query(`SELECT COALESCE(MAX(CAST (order_header_no as integer)),0)+1 as order_header_no from scm_sale_order_header where company_id=${company_id}`);
		data.push(`row('order_header_no',${orderheaderno [0][0].order_header_no})`);
		let dataResponse = await sequelize.query(
			`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_sale_order_header',0, array[${data}]::typ_record[],1,'order_header_id',1,1); commit;`

		);
		
		let order_header_id = dataResponse[0][0].p_internal_id;
		let saveQuantity = await sequelize.query(
			`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${order_header_id},'SALEORDER'); commit;`
		);
		if (randomData) {
			randomData.forEach(async (orderLine) => {
				let newData = [];
				newData.push(`row('order_header_id',${order_header_id})`);
				newData.push(`row('item_id',${orderLine.item_id})`);
				orderLine.amount && newData.push(`row('amount',${orderLine.amount})`);
				orderLine.discount && newData.push(`row('discount',${orderLine.discount.toString()})`);
				orderLine.discount_percent && newData.push(`row('discount_percent',${parseFloat(orderLine.discount_percent).toFixed(2)})`);
				orderLine.tax_percent && newData.push(`row('tax_percent',${numeral(orderLine.tax_percent).value()})`);
				orderLine.tax_amount && newData.push(`row('tax_amount',${orderLine.tax_amount})`);
				orderLine.net_amount && newData.push(`row('net_amount',${orderLine.net_amount})`);
				orderLine.rate && newData.push(`row('rate',${orderLine.rate})`);
				orderLine.quantity && newData.push(`row('quantity',${orderLine.quantity})`);
				orderLine.wash_id && newData.push(`row('wash_id',${orderLine.wash_id})`);
				orderLine.style_id && newData.push(`row('style_id',${orderLine.style_id})`);
				orderLine.commit_status && newData.push(`row('commit_status',${orderLine.commit_status})`);
				orderLine.quantity_committed ? newData.push(`row('quantity_committed',${orderLine.quantity_committed})`) : newData.push(`row('quantity_committed',0)`);
				orderLine.quantity_backorder ? newData.push(`row('quantity_backorder',${orderLine.quantity_backorder})`) : newData.push(`row('quantity_backorder',0)`);
				// randomData[i].quantity_committed && newData.push(`row('quantity_committed',${randomData[i].quantity_committed})`);

				newData.push(`row('created_by',${user_id})`);
				newData.push(`row('created_date',current_timestamp)`);
				newData.push(`row('is_deleted',0)`);
				let saveOrderLine = await sequelize.query(
					`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_sale_order_lines',0, array[${newData}]::typ_record[],1,'order_lines_id',1,1); commit;`
				);
				let order_lines_id = saveOrderLine[0][0].p_internal_id;
				let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sale_order_lines',${order_lines_id},1,'order_lines_id'); commit;`);
			});
		}
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sale_order_header',${order_header_id},1,'order_header_id'); commit;`);
		res.status(200).json({ data: "Record Inserted !", order_header_id, order_header_no: orderheaderno [0][0].order_header_no });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};
exports.getAll = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { startDate, endDate } = req.body;
		if (new Date(startDate) > new Date(endDate)) return res.status(400).json({ data: "Start date cannot be greater than End date" });
		let query = await sequelize.query(`select * from FUNC_GET_SALE_ORDER_GRID('${startDate}','${endDate}',${user_id},${session_id}) order by order_header_id desc`);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};
exports.getOne = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const id = req.params.Id;
		let { column_name, column_with_type } = await getCol("scm_sale_order_header", "order_header_id", "N");
		let query = await sequelize.query(
			`select ${column_name} from func_get_table_data('scm_sale_order_header','${column_name}','order_header_id',2,'${id}',${user_id},${session_id},1,0, 'ADMIN_COMPANY') as erptab (${column_with_type}) `
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
		// console.log("file: saleOrderHeader.js ~ line 101 ~ id", id);
		const { user_id, session_id } = req.user;
		const { is_closed, is_ship_complete, start_date, end_date, cancel_date, randomData } = req.body;
		if (new Date(end_date) < new Date(start_date)) return res.status(400).json({ data: "End date cannot be lesser than Start date" });
		if (new Date(cancel_date) < new Date(start_date)) return res.status(400).json({ data: "Cancel date cannot be lesser than Start date" });
		let { column_name, column_with_type } = await getCol("scm_sale_order_header", "order_header_id", "N");
		let data = await dataFilter(req.body);
		data.push(`row('last_updated_by',${user_id})`);
		data.push(`row('last_updated_date',current_timestamp)`);
		is_closed ? data.push(`row('is_closed','true')`) : data.push(`row('is_closed','false')`);
		is_closed && data.push(`row('closed_date',current_timestamp)`);
		is_ship_complete ? data.push(`row('is_ship_complete','true')`) : data.push(`row('is_ship_complete','false')`);

		let isExsist = await sequelize.query(
			`select ${column_name} from func_get_table_data('scm_sale_order_header','${column_name}','order_header_id',2,'${id}',${user_id},${session_id},1,0, 'ADMIN_COMPANY') as erptab (${column_with_type}) `
		);
		if (isExsist[1].rowCount === 0) {
			return res.status(404).json({ data: "Nothing Found !" });
		} else {
			
			dataResponse = await sequelize.query(
				`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'scm_sale_order_header',${id},array[${data}]::typ_record[],2,'order_header_id',0,0); COMMIT;`
			);
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sale_order_header',${id},2,'order_header_id'); commit;`);

			if (randomData?.length > 0) {
				for (let i = 0; i < randomData.length; i++) {
					if (randomData[i].order_lines_id) {
						console.log("this is if")
						
						let data =[]
						data.push(`row('tax_percent',${randomData[i].tax_percent})`);
						data.push(`row('rate',${randomData[i].rate})`);
						data.push(`row('amount',${randomData[i].amount})`);
						randomData[i].net_amount && data.push(`row('net_amount',${numeral(randomData[i].net_amount).value()})`);
						randomData[i].discount_percent && data.push(`row('discount_percent',${parseFloat(randomData[i].discount_percent).toFixed(2)})`);
						randomData[i].discount && data.push(`row('discount',${randomData[i].discount})`);
						randomData[i].tax_amount && data.push(`row('tax_amount',${randomData[i].tax_amount})`);
						randomData[i].quantity && data.push(`row('quantity',${randomData[i].quantity})`);
						randomData[i].commit_status && data.push(`row('commit_status',${randomData[i].commit_status})`);
						// console.log("this is if",data)
						// console.log("log",randomData[i].order_lines_id)
						let dataReponse = await sequelize.query(
							`BEGIN; call proc_erp_crud_operations(1,1,'scm_sale_order_lines',${randomData[i].order_lines_id},array[${data}]::typ_record[],2,'order_lines_id',0,0); COMMIT;`
						);
						
					} else {
						 let is_exist = await sequelize.query(`select * from scm_sale_order_lines where item_id=${randomData[i].item_id} AND order_header_id=${id} AND is_deleted=0`);
						 if (is_exist[1].rowCount !== 0) {
						 } else {
							console.log("this is else")
						 	let newData = [];
				 			console.log("randomData", randomData);
				 			newData.push(`row('order_header_id',${id})`);
				 			newData.push(`row('item_id',${randomData[i].item_id})`);
				 			randomData[i].rate && newData.push(`row('rate', ${randomData[i].rate})`);
							// order_lines_id=randomData[i].order_lines_id
							
				 			randomData[i].amount && newData.push(`row('amount',${randomData[i].amount})`);
				 			randomData[i].net_amount && newData.push(`row('net_amount',${randomData[i].net_amount.toString()})`);
				 			randomData[i].discount_percent && newData.push(`row('discount_percent',${parseInt(randomData[i].discount_percent)})`);
				 			randomData[i].discount && newData.push(`row('discount',${randomData[i].discount})`);
				 			randomData[i].tax_percent && newData.push(`row('tax_percent',${numeral(randomData[i].tax_perecnt).value()})`);
				 			randomData[i].tax_amount && newData.push(`row('tax_amount',${randomData[i].tax_amount})`);
				 			randomData[i].quantity && newData.push(`row('quantity',${randomData[i].quantity})`);
				 			randomData[i].wash_id && newData.push(`row('wash_id',${randomData[i].wash_id})`);
				 			randomData[i].style_id && newData.push(`row('style_id',${randomData[i].style_id})`);
				 			randomData[i].commit_status && newData.push(`row('commit_status',${randomData[i].commit_status})`);
				 			randomData[i].quantity_committed ? newData.push(`row('quantity_committed',${randomData[i].quantity_committed})`) : newData.push(`row('quantity_committed',0)`);
				 			randomData[i].quantity_backorder ? newData.push(`row('quantity_backorder',${randomData[i].quantity_backorder})`) : newData.push(`row('quantity_backorder',0)`);
				 			newData.push(`row('created_by',${user_id})`);
				 			newData.push(`row('created_date',current_timestamp)`);
				 			newData.push(`row('is_deleted',0)`);
							 
							
							 let saveOrderLine = await sequelize.query(
							 	`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_sale_order_lines',0, array[${newData}]::typ_record[],1,'order_lines_id',1,1); commit;`
								// `BEGIN; call proc_erp_crud_operations(1,1,'scm_sale_order_lines',${order_lines_id},array[${newData}]::typ_record[],2,'order_lines_id',0,0); COMMIT;`);
							 );

							 console.log("data", newData)
							//  let order_lines_id = saveOrderLine.map((val) => {
							// 	return val.p_internal_id;
							//  });
							 let order_lines_id = saveOrderLine[0][0].p_internal_id;
							 console.log("order line", order_lines_id)

							 let logQuery = await sequelize.query(
							 	`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sale_order_lines',${order_lines_id},1,'order_lines_id'); commit;`
							 );
						}
						
					}
				}
			}
			await sequelize.query(`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id}, 'SALEORDER'); commit;`)
			return res.status(200).json({ data: "Record Updated Successfully!" });
		}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.delete = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		let id = req.params.Id;
		let { column_name, column_with_type } = await getCol("scm_sale_order_lines", "order_lines_id", "N");
		let query = await sequelize.query(
			`select ${column_name} from func_get_table_data('scm_sale_order_lines','${column_name}','order_header_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `
		);
		if (query[1].rowCount === 0) {
			let dataResponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_sale_order_header',${id}, null,3,'order_header_id',0,0); commit;`);
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sale_order_header',${id},3,'order_header_id'); commit;`);
			return res.status(200).json({ data: "Record Deleted Successfully!" });
		} else {
			let dataResponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_sale_order_header',${id}, null,3,'order_header_id',0,0); commit;`);
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sale_order_header',${id},3,'order_header_id'); commit;`);
			for await (const single of query[0]) {
				let dataResponse = await sequelize.query(
					`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_sale_order_lines',${single.order_lines_id}, null,3,'order_lines_id',0,0); commit;`
				);
				let saveQuantity = await sequelize.query(`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'SALEORDER'); commit;`)
				let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sale_order_lines',${id},3,'order_lines_id'); commit;`);
			}
			return res.status(200).json({ data: "Record Deleted Successfully!" });
		}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.formByCompany = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { company_id, menu_id, customer_code, customer_name, customer_id } = req.body;
		let cName = customer_name ? customer_name : "%";
		let id = customer_id ? customer_id : 0;
		let from = "saleOrder";
		if (company_id && menu_id) {
			let query = await sequelize.query(`select * from func_get_customer_by_company(${company_id},'${customer_code ? customer_code : `%`}','${cName}',${id},${user_id},${session_id})`);
			let genders = await getGender.getAll(req, res, from);
			let adminLocation = await getAdminLocation.getAll(req, res, from);
			let orderStatus = await getOrderStatus.getAll(req, res, from);
			let adminRegion = await getAdminRegion.getAll(req, res, from);
			let salesPerson = await getSalesPerson.getAll(req, res, from);
			let freightTerm = await getFreightTest.getAll(req, res, from);
			let berganBilling = await getBerganBilling.getAll(req, res, from);
			let customerTerm = await getCustomerTerm.getAll(req, res, from);
			let shipVia = await getShipVia.getAll(req, res, from);
			let adminShipMethod = await getAdminShippingMethod.getAll(req, res, from);
			let adminShipTaxCode = await getAdminShipTaxCode.getAll(req, res, from);
			let adminFactor = await getAdminFactor.getAll(req, res, from);
			let termForPrint = await getTermForPrint.getAll(req, res, from);
			let berganPaymentTerm = await getAdminBerganPaymentTerm.getAll(req, res, from);
			let adminDiscount = await getAdminDiscount.getAll(req, res, from);

			let customerDetail = query[0]?.map((customer) => {
				return {
					customer_id: customer.customerid,
					customer_code: customer.customer_code,
					customer_name: customer.customer_name,
				};
			});
			let salesPersonDetail = salesPerson?.map((sale) => {
				return {
					sales_person_id: sale.sales_person_id,
					salesperson_name: sale.salesperson_name,
					is_active: sale.is_active,
				};
			});
			let factorDetail = adminFactor?.map((factor) => {
				return {
					factor_id: factor.factor_id,
					factor_name: factor.factor_name,
					is_active: factor.is_active,
				};
			});

			let discountDetail = adminDiscount?.map((discount) => {
				return {
					discount_id: discount.discount_id,
					discount_name: discount.discount_name,
					is_active: discount.is_active,
				};
			});
			res.status(200).json({
				adminRegionDetail: adminRegion,
				adminShipMethod,
				adminShipTaxCode,
				adminDiscount: discountDetail,
				berganBilling,
				berganPaymentTerm,
				customerDetail,
				customerTerm,
				factorDetail,
				freightTerm,
				gender: genders,
				locationDetail: adminLocation,
				orderStatusDetail: orderStatus,
				salesPersonDetail,
				shipVia,
				termForPrint,
			});
		}
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.genderSelect = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { gender, customerId } = req.body;
		let query = await sequelize.query(`select * from func_get_category_by_gender_id(${customerId},${gender},0,${user_id},${session_id})`);
		res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getBillingShipping = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { customerId } = req.body;
		let query = await sequelize.query(`select * from func_get_customer_default_billto_shipto(${customerId},${user_id},${session_id})`);
		res.status(200).json(query[0][0]);
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getProducts = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { item_code, company_id } = req.body;
		let query = await sequelize.query(`select * from func_get_product_for_sale(${company_id},${user_id},${session_id},'N','${item_code}')`);
		// let newRes = query[0].map((single) => {
		// 	return {
		// 		...single,
		// 		quantity: quantity,
		// 	};
		// });
		res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.customerSearch = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { company_id, customer_code, customer_name, customer_id } = req.body;
		let cName = customer_name ? customer_name : "%";
		let id = customer_id ? customer_id : 0;
		let query = await sequelize.query(`select * from func_get_customer_by_company(${company_id},'${customer_code ? customer_code : `%`}','${cName}',${id},${user_id},${session_id})`);
		let customerDetail = query[0]?.map((customer) => {
			return {
				customer_id: customer.customerid,
				customer_code: customer.customer_code,
				customer_name: customer.customer_name,
			};
		});
		res.status(200).json({ customerDetail });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getSaleOrderPrint = async (req, res) => {
	try {
	  const { user_id, session_id } = req.user;
	  const { order_header_id } = req.body;

		let query = await sequelize.query(
		// `select rate,item_code from func_get_sale_order_print(${order_header_id},${user_id},${session_id}) group by item_code,rate order by item_code`
		`select distinct bill_to_customer,customer_code,customer_name,bill_to_address_1,bill_to_address_2,bill_to_city_name,
		bill_to_state_name,bill_to_country,bill_to_zip,ship_to_addressee,ship_to_address_1,ship_to_address_2,ship_to_city_name,ship_to_state_name,
		ship_to_country_name,ship_to_zip,department,dc_no,store_name,sale_order_no,order_date,po_number,term,ship_via,frieght_terms,ship_date_from,ship_date_to,cancel_date,
		sum_gross_amount,net_amount,tax_percent,discount,sum_quantity,sum_quantity from func_get_sale_order_print(${order_header_id},${user_id},${session_id}) `
	  );
	  res.status(200).send({ data: query[0] });
	} catch (err) {
	  res.status(400).json(err.stack);
	}
  };

  exports.getSaleOrderitem = async (req, res) => {
	try {
	  const { user_id, session_id } = req.user;
	  const { order_header_id } = req.body;

		let query = await sequelize.query(
		`select distinct gender_category_id,item_code,gender_category_name,description,rate,item_quantity,amount from func_get_sale_order_print(${order_header_id},${user_id},${session_id}) `
	  );
	  res.status(200).send({ data: query[0] });
	} catch (err) {
	  res.status(400).json(err.stack);
	}
  };
  exports.getSaleOrderColumns = async (req, res) => {
	try {
	  const { user_id, session_id } = req.user;
	  const { order_header_id } = req.body;

		let query = await sequelize.query(
		// `select gender_Category_id,sku_size from func_get_sale_order_columns_print(${order_header_id},${user_id},${session_id})`
		`select * from func_get_sale_order_columns_print(${order_header_id},${user_id},${session_id})`
	  );
	  res.status(200).send({ data: query[0] });
	} catch (err) {
	  res.status(400).json(err.stack);
	}
  };
  exports.getSaleOrderColumnsValue = async (req, res) => {
	try {
	  const { user_id, session_id } = req.user;
	  const { order_header_id } = req.body;

		let query = await sequelize.query(
		`select t2.gender_Category_id, t2.item_code, rate,
		sum(round(coalesce(case when t3.hq23=t2.sku_size then quantity end,0),0)) q23,
		sum(round(coalesce(case when t3.hq24=t2.sku_size then quantity end,0),0)) q24,
		sum(round(coalesce(case when t3.hq25=t2.sku_size then quantity end,0),0)) q25,
		sum(round(coalesce(case when t3.hq26=t2.sku_size then quantity end,0),0)) q26,
		sum(round(coalesce(case when t3.hq27=t2.sku_size then quantity end,0),0)) q27,
		sum(round(coalesce(case when t3.hq28=t2.sku_size then quantity end,0),0)) q28,
		sum(round(coalesce(case when t3.hq29=t2.sku_size then quantity end,0),0)) q29,
		sum(round(coalesce(case when t3.hq30=t2.sku_size then quantity end,0),0)) q30,
		sum(round(coalesce(case when t3.hq31=t2.sku_size then quantity end,0),0)) q31,
		sum(round(coalesce(case when t3.hq32=t2.sku_size then quantity end,0),0)) q32,
		sum(round(coalesce(case when t3.hq33=t2.sku_size then quantity end,0),0)) q33,
		sum(round(coalesce(case when t3.hq34=t2.sku_size then quantity end,0),0)) q34,
		sum(round(coalesce(case when t3.hq35=t2.sku_size then quantity end,0),0)) q35,
		sum(round(coalesce(case when t3.hq36=t2.sku_size then quantity end,0),0)) q36,
		sum(round(coalesce(case when t3.hq37=t2.sku_size then quantity end,0),0)) q37,
		sum(round(coalesce(case when t3.hq38=t2.sku_size then quantity end,0),0)) q38,
		item_quantity, description,amount from
		func_get_sale_order_print(${order_header_id},${user_id},${session_id}) t2,
		func_get_sale_order_columns_print(${order_header_id},${user_id},${session_id}) t3
		where t2.gender_category_id=t3.gender_category_id
		group by t2.gender_Category_id,
		t2.item_code,
		rate,item_quantity,description,amount
		order by item_code `
	  );
	  res.status(200).send({ data: query[0] });
	} catch (err) {
	  res.status(400).json(err.stack);
	}
  };