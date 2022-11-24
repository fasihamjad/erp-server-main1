const { sequelize } = require("../../config/database")
const { getCol } = require("../../utils/helper");

exports.create = async (req, res) => {
    try {
        let { user_id, session_id } = req.user;
        let { fit_category_name, is_active, menu_id } = req.body;
        let { column_name, column_with_type } = await getCol("inv_fit_category", "fit_category_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_fit_category','${column_name}','fit_category_id',${menu_id},'-1',${user_id},${session_id},1,0) as erptab (${column_with_type})  where fit_category_name='${fit_category_name}'`)
        if (query[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_fit_category',0, array[row('fit_category_name','${fit_category_name}'),row('is_active','${is_active}'),row('created_by','${user_id}'),row('created_date',current_timestamp) ]::typ_record[],1,'fit_category_id',1,1); commit;`)
            let fit_category_id = dataReponse[0][0].p_internal_id
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_fit_category',${fit_category_id},1,'fit_category_id'); commit;`)
            res.status(200).json({ data: "Record Inserted !", fit_category_id })
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
        if (from !== "items") {
            let { column_name, column_with_type } = await getCol("inv_fit_category", "fit_category_id", "N")
            query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_fit_category','${column_name}','fit_category_id',${menu_id},'-1','${user_id}','${session_id}',1,0,'GET_SETUP_DATA') as erptab (${column_with_type}) ORDER BY fit_category_id DESC, created_date`);
            return res.status(200).json({ data: query[0] })

        }
        if (from === "items") {
            let sqleuery = "";
            sqleuery += " select fit_category_id,fit_category_name,is_active from inv_fit_category st ";
            sqleuery += "  where st.is_deleted=0  ";
            sqleuery += `  and exists(select '' from  admin_company_entity_access acea where acea.entity_id=11 and acea.entity_record_id=st.fit_category_id and acea.company_id=${company_id})  `;
            query = await sequelize.query(sqleuery)
            // query = await sequelize.query(`select ${column_name} from func_get_table_data_by_company(${company_id},'inv_fit_category','fit_category_id','${column_name}',${user_id},${session_id},'MULTI_COMPANY') as erptab (${column_with_type}) ORDER BY fit_category_name ASC `)
            return query[0]
        }
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        let { column_name, column_with_type } = await getCol("inv_fit_category", "fit_category_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_fit_category','${column_name}','fit_category_id',2,'${id}',1,1000) as erptab (${column_with_type}) `)
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

        let { user_id, session_id } = req.user
        let { fit_category_name, is_active } = req.body
        let id = req.params.Id;
        let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'inv_fit_category',${id},array[row('fit_category_name','${fit_category_name}'),row('is_active','${is_active}'),row('last_modified_by','${user_id}'),row('last_modified_date',current_timestamp) ]::typ_record[],2,'fit_category_id',0,0); COMMIT;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_fit_category',${id},2,'fit_category_id'); commit;`)
        res.status(200).json({ data: "Record Updated Successfully!" })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.delete = async (req, res) => {
    try {
        let id = req.params.Id
        let { user_id, session_id } = req.user
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_fit_category',${id},3,'fit_category_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'inv_fit_category',${id}, null,3,'fit_category_id',0,0); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}