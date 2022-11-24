const { sequelize } = require("../../../config/database");
const { getCol } = require("../../../utils/helper");

exports.create = async (req, res) => {
    try {
        let { user_id, session_id } = req.user
        let { payment_method_name, is_active, menu_id } = req.body
        let { column_name, column_with_type } = await getCol("admin_payment_method", "payment_method_id ", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_payment_method','${column_name}','payment_method_id',${menu_id},'-1',${user_id},${session_id},1,0) as erptab (${column_with_type})  where payment_method_name='${payment_method_name}'`)
        if (query[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_payment_method',0, array[row('payment_method_name','${payment_method_name}'),row('is_active','${is_active}'),row('created_by','${user_id}'),row('created_date',current_timestamp) ]::typ_record[],1,'payment_method_id',1,1); commit;`)
            let payment_method_id = dataReponse[0][0].p_internal_id
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_payment_method',${payment_method_id},1,'payment_method_id'); commit;`)
            res.status(200).json({ data: "Record Inserted !", payment_method_id })
        }
        else {
            res.status(200).json({ data: "Record already exists !" })
        }
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getAll = async (req, res, from) => {
    try {
        let { session_id, user_id } = req.user;
        let { menu_id, company_id } = req.body;
        let query;

        if (from === "items" || from === "saleOrder") {
            let sqleuery = "";
            sqleuery += " select payment_method_id, payment_method_name,is_active from admin_payment_method st ";
            sqleuery += "  where st.is_deleted=0  ";
            query = await sequelize.query(sqleuery)
            return query[0]
        } else {
            let { column_name, column_with_type } = await getCol("admin_payment_method", "payment_method_id", "N");
            query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_payment_method','${column_name}','payment_method_id',${menu_id},'-1','${user_id}','${session_id}',1,0,'GET_SETUP_DATA') as erptab (${column_with_type}) ORDER BY payment_method_name`);
            return res.status(200).json({ data: query[0] })
        }

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getOne = async (req, res) => {
    try {
        const { session_id, user_id } = req.user;
        const id = req.params.Id
        let { column_name, column_with_type } = await getCol("admin_payment_method", "payment_method_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_payment_method','${column_name}','payment_method_id',2,'${id}',${user_id},${session_id},1,0) as erptab (${column_with_type}) `)
        if (query[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found !" })
        }
        else {
            res.status(200).json({ data: query[0] })
        }
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.update = async (req, res) => {
    try {
        let id = req.params.Id
        const { user_id, session_id } = req.user
        let { payment_method_name, is_active } = req.body
        let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'admin_payment_method',${id},array[row('payment_method_name','${payment_method_name}'),row('is_active','${is_active}'),row('last_modified_by','${user_id}'),row('last_modified_date',current_timestamp) ]::typ_record[],2,'payment_method_id',0,0); COMMIT;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_payment_method',${id},2,'payment_method_id'); commit;`)
        res.status(200).json({ data: "Record Updated Successfully!" })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.delete = async (req, res) => {
    try {
        let id = req.params.Id
        const { user_id, session_id } = req.user
        let { column_name, column_with_type } = await getCol("admin_payment_method", "payment_method_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_payment_method','${column_name}','payment_method_id',2,'${id}',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
        
        if (query[1].rowCount === 0){
            res.status(404).json({ data: "No Record Found !" })
        }
        else {
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_payment_method',${id},3,'payment_method_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_payment_method',${id}, null,3,'payment_method_id',0,0); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
        }   
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
