const { sequelize } = require("../../config/database");
const { getCol } = require("../../utils/helper");
const getStyles = require("../Style/style");
const getGender = require("../Gender/gender");
const getGenderCategory = require("../Gender_Category/gender_category");
const getWash = require("../Wash/wash");
const getFabric = require("../Fabric/fabric");
const getProductType = require("../Item_Type/item_type");
const getProductClass = require("../Product_Class/product_class");
const getProductStatus = require("../Product_Status/product_status");
const getSeason = require("../Season/season");
const getWashType = require("../Wash_Type/wash_type");
const getRiseLabel = require("../Rise_Label/rise_label");
const getFitCategory = require("../Fit_Category/fit_category");
const getInseamLabel = require("../InseamLabel/InseamLabel");
const getRise = require("../Rise/Rise");
const getCut = require("../Cut/Cut");
const getInseam = require("../Inseam/inseam");
const getSize = require("../Size/size");

//CRUD Operations
exports.create = async (req, res) => {
	try {
		const { item_code, random, gender_category_id, gender_id, fit_category_id, item_name } = req.body;
		const { user_id, session_id } = req.user;
		let data = [];
		let newBody = Object.keys(req.body);
		let newVal = Object.values(req.body);
		for (let i = 0; i < newBody.length; i++) {
			if (typeof newVal[i] === "string") {
				if (newBody[i] === "product_date" || newBody[i] === "inactive_date") {
					data.push(`row('${newBody[i]}',current_timestamp)`);
				} else {
					data.push(`row('${newBody[i]}','${newVal[i]}')`);
				}
			}
			if (typeof newVal[i] === "number") {
				data.push(`row('${newBody[i]}',${newVal[i]})`);
			}
		}
		data.push(`row('created_date',current_timestamp)`);
		data.push(`row('product_date',current_timestamp)`);
		data.push(`row('is_active',true)`);
		data.push(`row('created_by',${user_id})`);

		let { column_name, column_with_type } = await getCol("inv_item", "item_id", "N");
		let query = await sequelize.query(
			`select ${column_name} from func_get_table_data('inv_item','${column_name}','item_id',2,'-1',${user_id},${session_id},1,0) as erptab (${column_with_type})  where ( item_code='${item_code}')`
		);

		if (query[1].rowCount === 0) {
			let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_item',0, array[${data}]::typ_record[],1,'item_id',1,1); commit;`);
			let item_id = dataReponse[0][0].p_internal_id;

			random?.forEach(async (f, index) => {
				let newData = [];
				newData.push(`row('item_code','${f.item_code}')`);
				newData.push(`row('gender_category_id',${gender_category_id})`);
				newData.push(`row('gender_id',${gender_id})`);
				newData.push(`row('fit_category_id',${fit_category_id})`);
				newData.push(`row('inseam','${f.inseam}')`);
				newData.push(`row('size','${f.size}')`);
				newData.push(`row('inseam_id',${f.inseam_id})`);
				newData.push(`row('size_id','${f.size_id}')`);
				newData.push(`row('created_date',current_timestamp)`);
				newData.push(`row('product_date',current_timestamp)`);
				newData.push(`row('is_active',true)`);
				newData.push(`row('created_by',${user_id})`);
				newData.push(`row('parent_item_id',${item_id})`);
				f.upc_code && newData.push(`row('upc_code','${f.upc_code}')`);
				f.nrf_color_code && newData.push(`row('nrf_color_code',${f.nrf_color_code})`);
				f.nrf_size_code && newData.push(`row('nrf_size_code',${f.nrf_size_code})`);

				let childResponse = await sequelize.query(
					`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_item',0, array[${newData}]::typ_record[],1,'item_id',1,1); commit;`
				);
				let item_child_id = childResponse[0][0].p_internal_id;
				let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_item',${item_child_id},1,'item_id'); commit;`);
			});
			// console.log("file: items.js ~ line 57 ~ item_id", item_id);
			// let inseams = await getInseam.getAll(req, res, from);
			// let sizes = await getSize.getAll(req, res, from);

			// let inseamIds = inseams.map(inseam => { return { inseam_id: inseam.inseam_id } });
			// let sizeIds = sizes.map(size => { return { size_id: size.size_id } });

			// let inseamCreate = await this.createInseam(item_id, inseamIds);
			// let sizeCreate = await this.createSize(item_id, sizeIds);

			// //userID & sessionID by token

			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_item',${item_id},1,'item_id'); commit;`);
			res.status(200).json({ data: "Record Inserted !", p_internal_id: dataReponse[0] });
		} else {
			res.status(409).json({ data: "Item already exists !" });
		}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
exports.getAll = async (req, res) => {
	try {
		let { session_id, user_id } = req.user;
		let query = await sequelize.query(`select * from func_get_product_grid(${user_id},${session_id})`);
		// let { filter } = req.query;
		// let { column_name, column_with_type } = await getCol("inv_item", "item_id", `${filter}`);
		// let query = await sequelize.query(`select  * from func_get_table_data('inv_item','${column_name}','item_id',2,'-1',${user_id},${session_id},1,0,'GET_SETUP_DATA', ' AND PARENT_ITEM_ID IS NULL ')  as erptab (${column_with_type} ) ORDER BY item_id DESC `)
		// console.log("query[0]",query[0])
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
exports.getOne = async (req, res) => {
	try {
		const id = req.params.Id;
		const { user_id, session_id } = req.user;
		let { column_name, column_with_type } = await getCol("inv_item", "item_id", "N");
		let query = await sequelize.query(
			`select ${column_name} from func_get_table_data('inv_item','${column_name}','item_id',2,'${id}',${user_id},${session_id},1,0,'ALLOWED_COMPANIES') as erptab (${column_with_type}) `
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
		const { random, item_name, gender_category_id, gender_id, fit_category_id } = req.body;
		let data = [];
		let newBody = Object.keys(req.body);
		let newVal = Object.values(req.body);
		for (let i = 0; i < newBody.length; i++) {
			if (typeof newVal[i] === "string") {
				if (newBody[i] === "product_date" || newBody[i] === "inactive_date") {
					data.push(`row('${newBody[i]}',current_timestamp)`);
				} else {
					data.push(`row('${newBody[i]}','${newVal[i]}')`);
				}
			}
			if (typeof newVal[i] === "number") {
				data.push(`row('${newBody[i]}',${newVal[i]})`);
			}
			if (typeof newVal[i] === "boolean") {
				data.push(`row('${newBody[i]}',${newVal[i]})`);
			}
		}

		let { column_name, column_with_type } = await getCol("inv_item", "item_id", "N");
		let isFined = await sequelize.query(`select ${column_name} from func_get_table_data('inv_item','${column_name}','item_id',2,'${id}',1,1000) as erptab (${column_with_type}) `);
		if (isFined[1].rowCount === 0) {
			res.status(404).json({ data: "No Record Found !" });
		} else {
			dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'inv_item',${id},array[${data}]::typ_record[],2,'item_id',0,0); COMMIT;`);
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_item',${id},2,'item_id'); commit;`);

			// console.log("data: ", data);
			// console.log("randomData", req.body);
			random?.forEach(async (f) => {
				if (!f.item_id) {
					let newData = [];
					newData.push(`row('item_code','${f.item_code}')`);
					newData.push(`row('gender_category_id',${gender_category_id})`);
					newData.push(`row('gender_id',${gender_id})`);
					newData.push(`row('fit_category_id',${fit_category_id})`);
					newData.push(`row('inseam','${f.inseam}')`);
					newData.push(`row('size','${f.size}')`);
					newData.push(`row('inseam_id',${f.inseam_id})`);
					newData.push(`row('size_id','${f.size_id}')`);
					newData.push(`row('created_date',current_timestamp)`);
					newData.push(`row('product_date',current_timestamp)`);
					newData.push(`row('is_active',true)`);
					newData.push(`row('created_by',${user_id})`);
					newData.push(`row('parent_item_id',${id})`);
					f.upc_code && newData.push(`row('upc_code','${f.upc_code}')`);
					f.nrf_color_code && newData.push(`row('nrf_color_code',${f.nrf_color_code})`);
					f.nrf_size_code && newData.push(`row('nrf_size_code',${f.nrf_size_code})`);

					let childResponse = await sequelize.query(
						`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_item',0, array[${newData}]::typ_record[],1,'item_id',1,1); commit;`
					);
					let item_child_id = childResponse[0][0].p_internal_id;
					let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_item',${item_child_id},1,'item_id'); commit;`);
				}
			});

			res.status(200).json({ data: "Record Updated Successfully!" });
		}
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
exports.delete = async (req, res) => {
	try {
		let id = req.params.Id;
		let { user_id, session_id } = req.user;
		let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_item',${id},3,'item_id'); commit;`);
		let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'inv_item',${id}, null,3,'item_id',0,0); commit;`);
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

//Start of create Inseam & Sizes

exports.createInseam = async (itemId, data) => {
	try {
		data.forEach(async (id) => {
			let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'inv_item_inseam',0, array[
                    row('item_Id','${itemId}'),
                    row('inseam_id','${id.inseam_id}'),
                    row('is_selected','false'),
                    row('created_by','1'),
                    row('is_deleted',0),
                    row('created_date',current_timestamp)
                ]::typ_record[],1,'item_inseam_sno',1,1); commit;`);
			let item_inseam_id = dataReponse[0][0].p_internal_id;
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(1,1,'INV_ITEM_INSEAM',${item_inseam_id},1,'item_inseam_sno'); commit;`);
		});
		// res.status(200).json({ data: "Record Inserted !" })
	} catch (err) {
		console.log("err: ", err);
	}
};

exports.createSize = async (itemId, data) => {
	try {
		data.forEach(async (id) => {
			let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'inv_item_size',0, array[
                row('item_id','${itemId}'),
                row('size_id','${id.size_id}'),
                row('is_selected','false'),
                row('created_by','1'),
                row('is_deleted',0),
                row('created_date',current_timestamp)
            ]::typ_record[],1,'item_size_sno',1,1); commit;`);
			let item_size_id = dataReponse[0][0].p_internal_id;
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(1,1,'inv_item_size',${item_size_id},1,'item_size_sno'); commit;`);
		});
	} catch (err) {
		console.log("err: ", err);
	}
};

//Start of update Inseam & Sizes
exports.updateInseam = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { item_inseam_sno } = req.body;
		item_inseam_sno.forEach(async (id) => {
			let { column_name, column_with_type } = await getCol("inv_item_inseam", "item_inseam_sno", "N");
			let isExists = await sequelize.query(
				`select ${column_name} from func_get_table_data('inv_item_inseam','${column_name}','item_inseam_sno',2,'${id}',1,1,1,0) as erptab (${column_with_type}) `
			);
			let dataReponse = await sequelize.query(
				`BEGIN; call proc_erp_crud_operations(1,1,'inv_item_inseam',${id},array[row('is_selected','true'),row('last_updated_by','${user_id}'),row('last_updated_date',current_timestamp) ]::typ_record[],2,'item_inseam_sno',0,0); COMMIT;`
			);
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_item_inseam',${id},2,'item_inseam_sno'); commit;`);
		});
		res.status(200).json({ data: "Record updated !" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
exports.updateSize = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const { item_size_sno } = req.body;
		item_size_sno.forEach(async (id) => {
			let { column_name, column_with_type } = await getCol("inv_item_size", "item_size_sno", "N");
			let isExists = await sequelize.query(
				`select ${column_name} from func_get_table_data('inv_item_size','${column_name}','item_size_sno',2,'${id}',1,1,1,0) as erptab (${column_with_type}) `
			);

			let dataReponse = await sequelize.query(
				`BEGIN; call proc_erp_crud_operations(1,1,'inv_item_size',${id},array[row('is_selected','true'),row('last_updated_by','${user_id}'),row('last_updated_date',current_timestamp) ]::typ_record[],2,'item_size_sno',0,0); COMMIT;`
			);
			let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_item_size',${id},2,'item_size_sno'); commit;`);
		});
		res.status(200).json({ data: "Record updated !" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

//Start of get Inseam & Sizes
exports.getInseam = async (req, res, from) => {
	try {
		const { Id } = req.params;
		const { user_id, session_id } = req.user;
		let { column_name, column_with_type } = await getCol("inv_item_inseam", "item_id", "N");
		let query = await sequelize.query(
			`select func_get_value_by_id('inv_inseam', 'inseam_id', 'inseam_name', inseam_id::character varying) as inseam_name,${column_name} from func_get_table_data('inv_item_inseam','${column_name}','item_id',2,'${Id}',${user_id},${session_id},1,0,'GET_SETUP_DATA') as erptab (${column_with_type})`
		);

		if (from === "generate") {
			return query[0];
		}
		res.status(200).send(query[0]);
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getSize = async (req, res, from) => {
	try {
		const { Id } = req.params;
		let { column_name, column_with_type } = await getCol("inv_item_size", "item_id", "N");
		let query = await sequelize.query(
			`select func_get_value_by_id('inv_size', 'size_id', 'size_name', size_id::character varying) as size_name,${column_name} from func_get_table_data('inv_item_size','${column_name}','item_id',2,'${Id}','1','1',1,0,'GET_SETUP_DATA') as erptab (${column_with_type})`
		);
		if (from === "generate") {
			return query[0];
		}
		res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

//DropDown selection API
exports.getDetail = async (req, res) => {
	try {
		let from = "items";
		const { company_id, menu_id } = req.body;
		if (!company_id || !menu_id || company_id === "undefined") return res.status(404).send({ data: "Company or Menu is missing" });
		if (company_id) {
			let styles = await getStyles.getAllStyle(req, res, from);
			let cuts = await getCut.getAll(req, res, from);
			let fitCategories = await getFitCategory.getAll(req, res, from);
			let wash = await getWash.getAll(req, res, from);
			let washTypes = await getWashType.getAll(req, res, from);
			let genders = await getGender.getAll(req, res, from);
			let genderCategories = await getGenderCategory.getAll(req, res, from);
			let rises = await getRise.getAll(req, res, from);
			let riseLabels = await getRiseLabel.getAll(req, res, from);
			let productTypes = await getProductType.getAll(req, res, from);
			let productClass = await getProductClass.getAll(req, res, from);

			let fabrics = await getFabric.getAll(req, res, from);
			let productStatus = await getProductStatus.getAll(req, res, from);
			let seasons = await getSeason.getAll(req, res, from);
			let inseamLabels = await getInseamLabel.getAll(req, res, from);

			let styleDetail = styles.map((style) => {
				return {
					style_id: style.style_id,
					style_name: style.style_name,
					is_active: style.is_active,
				};
			});
			let cutsDetail = cuts.map((cut) => {
				return {
					cut_id: cut.cut_id,
					cut_name: cut.cut_name,
					is_active: cut.is_active,
				};
			});
			let fitCategoryDetail = fitCategories.map((fitCategory) => {
				return {
					fit_category_id: fitCategory.fit_category_id,
					fit_category_name: fitCategory.fit_category_name,
					is_active: fitCategory.is_active,
				};
			});
			let washNameDetail = wash.map((wash) => {
				return {
					wash_id: wash.wash_id,
					wash_name: wash.wash_name,
					is_active: wash.is_active,
				};
			});
			let washTypeDetail = washTypes.map((washType) => {
				return {
					wash_type_id: washType.wash_type_id,
					wash_type_name: washType.wash_type_name,
					is_active: washType.is_active,
				};
			});
			let genderDetail = genders.map((gender) => {
				return {
					gender_id: gender.gender_id,
					gender_name: gender.gender_name,
					is_active: gender.is_active,
				};
			});
			let genderCategoryDetail = genders.map((gender) => {
				return {
					id: gender.gender_id,
					data: genderCategories.filter((single) => {
						if (gender.gender_id === single.gender_id) {
							return single;
						}
					}),
				};
			});
			let riseDetail = rises.map((rise) => {
				return {
					rise_id: rise.rise_id,
					rise_name: rise.rise_name,
					is_active: rise.is_active,
				};
			});
			let riseLabelDetail = riseLabels.map((riseLabel) => {
				return {
					rise_label_id: riseLabel.rise_label_id,
					rise_label_name: riseLabel.rise_label_name,
					is_active: riseLabel.is_active,
				};
			});
			let productTypeDetail = productTypes.map((product) => {
				return {
					item_type_id: product.item_type_id,
					item_type_name: product.item_type_name,
					is_active: product.is_active,
				};
			});
			let productClassDetail = productClass.map((product) => {
				return {
					product_class_id: product.product_class_id,
					product_class_name: product.product_class_name,
					is_active: product.is_active,
				};
			});
			let fabricDetail = fabrics.map((fabric) => {
				return {
					fabric_id: fabric.fabric_id,
					fabric_name: fabric.fabric_name,
					is_active: fabric.is_active,
				};
			});
			let productStatusDetail = productStatus.map((product) => {
				return {
					product_status_id: product.product_status_id,
					product_status_name: product.product_status_name,
					is_active: product.is_active,
				};
			});
			let seasonDetail = seasons.map((season) => {
				return {
					season_id: season.season_id,
					season_name: season.season_name,
					is_active: season.is_active,
				};
			});
			let inseamLabelDetail = inseamLabels.map((inseamLabel) => {
				return {
					inseam_label_id: inseamLabel.inseam_label_id,
					inseam_label_name: inseamLabel.inseam_label_name,
					is_active: inseamLabel.is_active,
				};
			});
			Promise.all([
				styleDetail,
				washNameDetail,
				riseDetail,
				cutsDetail,
				inseamLabelDetail,
				fitCategoryDetail,
				riseLabelDetail,
				washTypeDetail,
				seasonDetail,
				productStatusDetail,
				productClassDetail,
				fabricDetail,
				productStatus,
				productTypeDetail,
				genderCategoryDetail,
				genderDetail,
			])
				.then(() => {
					res.status(200).json({
						styleDetail,
						washNameDetail,
						riseDetail,
						cutsDetail,
						inseamLabelDetail,
						fitCategoryDetail,
						riseLabelDetail,
						washTypeDetail,
						seasonDetail,
						productStatusDetail,
						productClassDetail,
						productTypeDetail,
						fabricDetail,
						genderCategoryDetail,
						genderDetail,
					});
				})
				.catch((err) => console.log("err: item.js: line:466", err));
		}
	} catch (err) {
		console.log("ERROR", req.params);
		res.status(400).send(err.stack);
	}
};

exports.generateProduct = async (req, res) => {
	try {
		let { item_id } = req.body;
		let productCombination = await sequelize.query(`begin; call proc_generate_product_combination(${item_id},'1'); commit`);
		let msg = productCombination[0][0].p_result;
		res.status(200).json({ msg });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getProductCombination = async (req, res) => {
	try {
		let { session_id, user_id } = req.user;
		let { Id } = req.params;
		let { column_name, column_with_type } = await getCol("inv_item", "item_id", "N");
		let query = await sequelize.query(
			`select ${column_name} from func_get_table_data('inv_item','${column_name}','parent_item_id',8,'${Id}',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type})`
		);

		res.status(200).json({ data: query[0] });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getItemTransaction = async (req, res) => {
	try {
		const { id } = req.body
		let { session_id, user_id } = req.user;
		let query = await sequelize.query(`select * from func_get_item_related_transaction(${id}, ${user_id}, ${session_id})`);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};