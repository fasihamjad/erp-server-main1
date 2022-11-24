const { sequelize } = require("../../../config/database")
const { getCol, dataFilter, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
    try {
        let { user_id, session_id, } = req.user
        const { is_active, customers } = req.body;
        let { column_name, column_with_type } = await getCol("scm_customer_sales_category", "customer_sales_category_id", "N");
        if (customers) {
            for (let i = 0; i < customers.length; i++) {
                let com = Object.keys(customers[i]);
                for (let j = 0; j < com.length; j++) {
                    if (!column_name.includes(com[j])) return res.status(400).send({ data: "something went wrong" })
                }
                let newData = await boolFilter(customers[i])
                newData.push(`row('is_deleted',0)`);
                let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_customer_sales_category',0, array[${newData}]::typ_record[],1,'customer_sales_category_id',1,1); commit;`)
                let customer_sales_category_id = dataReponse[0][0].p_internal_id;
                let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_customer_sales_category',${customer_sales_category_id},1,'customer_sales_category_id'); commit;`);
            }

            return res.status(200).json({ data: "Customers Ship Added !" })
        }
        if (!customers) {
            let data = await dataFilter(req.body);
            is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
            data.push(`row('created_by',${user_id})`);
            data.push(`row('created_date',current_timestamp)`);
            data.push(`row('is_deleted',0)`);
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_customer_sales_category',0, array[${data}]::typ_record[],1,'customer_sales_category_id',1,1); commit;`)
            let customer_sales_category_id = dataReponse[0][0].p_internal_id;
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_customer_sales_category',${customer_sales_category_id},1,'customer_sales_category_id'); commit;`);
            return res.status(200).json({ data: "Record Inserted !", customer_sales_category_id })
        }

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user
        let { column_name, column_with_type } = await getCol("scm_customer_sales_category", "customer_sales_category_id", "Y");
        let query = await sequelize.query(`select * from func_get_table_data('scm_customer_sales_category','${column_name}','customer_sales_category_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
        res.status(200).send({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        const { user_id, session_id } = req.user
        let { column_name, column_with_type } = await getCol("scm_customer_sales_category", "customer_sales_category_id", "Y")
        let query = await sequelize.query(`select * from func_get_table_data('scm_customer_sales_category','${column_name}','customer_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
        if (query[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found !" })
        }
        else {
            res.status(200).json({ data: query[0] })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.update = async (req, res) => {
    try {
        let { user_id, session_id } = req.user
        let id = req.params.Id;
        const { is_active } = req.body;
        let { column_name, column_with_type } = await getCol("scm_customer_sales_category", "customer_sales_category_id", "Y");
        let data = await dataFilter(req.body);
        is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
        data.push(`row('last_updated_by',${user_id})`);
        data.push(`row('last_updated_date',current_timestamp)`);

        let isExsist = await sequelize.query(`select * from func_get_table_data('scm_customer_sales_category','${column_name}','customer_sales_category_id',2,'${id}',${user_id},${session_id},1,100, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found !" })
        }
        else {

            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'scm_customer_sales_category',${id},array[${data}]::typ_record[],2,'customer_sales_category_id',0,0); COMMIT;`);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_customer_sales_category',${id},2,'customer_sales_category_id'); commit;`)
            res.status(200).json({ data: "Record Updated Successfully!" })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.delete = async (req, res) => {
    try {
        const { user_id, session_id } = req.user
        let id = req.params.Id;
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_customer_sales_category',${id}, null,3,'customer_sales_category_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_customer_sales_category',${id},3,'customer_sales_category_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}