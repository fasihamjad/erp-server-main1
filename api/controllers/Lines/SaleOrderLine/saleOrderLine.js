const { sequelize } = require("../../../config/database")
const { getCol, dataFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { is_active, order_header_id } = req.body;
        let data = await dataFilter(req.body);
        data.push(`row('created_by',${user_id})`);
        data.push(`row('created_date',current_timestamp)`);
        data.push(`row('is_deleted',0)`);
        let { column_name, column_with_type } = await getCol("scm_sale_order_lines", "order_lines_id", "N");
        let isFined = await sequelize.query(`select ${column_name} from func_get_table_data('scm_sale_order_lines','${column_name}','order_lines_id',2,'-1',${user_id}, ${session_id},1,0) as erptab (${column_with_type}) where order_header_id='${order_header_id}' `);

        if (isFined[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_sale_order_lines',0, array[${data}]::typ_record[],1,'order_lines_id',1,1); commit;`);

            //let ship_header_id = dataReponse[0][0].p_internal_id;
            
            let saveQuantity = await sequelize.query(
				`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${order_header_id},'SALEORDER'); commit;`
			);

            let order_lines_id = dataReponse[0][0].p_internal_id;
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sale_order_lines',${order_lines_id},1,'order_lines_id'); commit;`);
            res.status(200).json({ data: "Record Inserted !", order_lines_id })
        }
        else {
            res.status(409).json({ data: "Order header id already exists" })
        }
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("scm_sale_order_lines", "order_lines_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('scm_sale_order_lines','${column_name}','order_lines_id',2,'-1',${user_id},${session_id},1,0,'GET_SETUP_DATA') as erptab (${column_with_type}) `)
        res.status(200).send({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        const { user_id, session_id } = req.user;
        // let { column_name, column_with_type } = await getCol("scm_sale_order_lines", "order_lines_id", "N")
        let query = await sequelize.query(`select * from  func_get_sale_order_lines_grid(${id}, ${user_id}, ${session_id})`)
        if (query[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found !" })
        }
        else {
            let newData = query[0].map((single) => {
                return {
                    ...single,
                    isSelected: true
                }
            })
            res.status(200).json({ data: newData })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

exports.update = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        let id = req.params.Id;
        let { column_name, column_with_type } = await getCol("scm_sale_order_lines", "order_lines_id", "N");
        let data = await dataFilter(req.body);
        data.push(`row('last_updated_by',${user_id})`);
        data.push(`row('last_updated_date',current_timestamp)`);
        let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('scm_sale_order_lines','${column_name}','order_lines_id',2,'${id}',1,0) as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found !" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'scm_sale_order_lines',${id},array[${data}]::typ_record[],2,'order_lines_id',0,0); COMMIT;`);
            let saveQuantity = await sequelize.query(
				`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'SALEORDER'); commit;`
			);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sale_order_lines',${id},2,'order_lines_id'); commit;`)
            res.status(200).json({ data: "Record Updated Successfully!" })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.delete = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        let id = req.params.Id;
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'scm_sale_order_lines',${id}, null,3,'order_lines_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sale_order_lines',${id},3,'order_lines_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
};

exports.deleteThroughHeader = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        let id = req.params.Id;
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'scm_sale_order_lines',${id}, null,3,'order_header_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sale_order_lines',${id},3,'order_lines_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
};

exports.getItemByCompany = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        const { company_id } = req.body;
        let query = await sequelize.query(`select item_id, item_code from inv_item where is_active = TRUE AND parent_item_id is not null AND company_id = ${company_id}`)
        res.status(200).send({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getSaleOrderRelatedRecord = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const order_header_id = req.params.Id;
		let query = await sequelize.query(`select * from func_get_sale_order_related_transaction(${order_header_id},${user_id},${session_id}) `);
		if (!query[0][0]) return res.status(404).json({ data: "Record not found" });
		return res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
exports.getOneLines = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
        const {item_id, order_header_id} = req.body;
		// const order_header_id = req.params.Id;
		let query = await sequelize.query(`select * from func_get_sale_order_lines_grid(${order_header_id},${user_id},${session_id}) where item_id =  ${item_id}`);
		if (!query[0][0]) return res.status(404).json({ data: "Record not found" });
		return res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

