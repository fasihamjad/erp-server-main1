const { sequelize } = require("../../../config/database")
const { getCol } = require("../../../utils/helper");

exports.create = async (req, res) => {
    try {
        const { session_id, user_id } = req.user;

        let { module_name, is_active, created_by } = req.body;
        let { column_name, column_with_type } = await getCol("admin_module", "module_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_module','${column_name}','module_id',2,'-1',${user_id},${session_id},1,0) as erptab (${column_with_type})  where module_name='${module_name}'`)
        if (query[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_module',0, array[row('module_name','${module_name}'),row('is_active','${is_active}'),row('created_by','${user_id}'),row('created_date',current_timestamp) ]::typ_record[],1,'module_id',1,1); commit;`)
            let module_id = dataReponse[0][0].p_internal_id
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_module',${module_id},1,'module_id'); commit;`)
            res.status(200).json({ data: "Record Inserted !", p_internal_id: dataReponse[0] })
        }
        else {
            res.status(200).json({ data: "Record already exists !" })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        const { session_id, user_id } = req.user;
        let { column_name, column_with_type } = await getCol("admin_module", "module_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_module','${column_name}','module_id',2,'-1','${user_id}','${session_id}',1,1000,'GET_SETUP_DATA') as erptab (${column_with_type})`)
        if (from === "adminMenu") {
            return query[0];
        }
        else {
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
        const id = req.params.Id;
        let { column_name, column_with_type } = await getCol("admin_module", "module_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_module','${column_name}','module_id',2,'${id}',${user_id},${session_id},1,0) as erptab (${column_with_type}) `)
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
        const { session_id, user_id } = req.user;
        let id = req.params.Id
        let { module_name, created_by, is_active } = req.body
        let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'admin_module',${id},array[row('module_name','${module_name}'),row('is_active','${is_active}'),row('created_by','${user_id}'),row('created_date',current_timestamp) ]::typ_record[],2,'module_id',0,0); COMMIT;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_module',${id},2,'module_id'); commit;`)
        res.status(200).json({ data: "Record Updated Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.delete = async (req, res) => {
    try {
        let id = req.params.Id
        const { user_id, session_id } = req.user
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_module',${id},3,'module_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_module',${id}, null,3,'module_id',0,0); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}