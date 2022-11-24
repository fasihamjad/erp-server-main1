const { sequelize } = require("../../config/database")
const { getCol } = require("../../utils/helper");

exports.create = async (req, res) => {
    try {
        let { user_id, session_id } = req.user
        let { cut_name, is_active, menu_id } = req.body
        let { column_name, column_with_type } = await getCol("inv_cut", "cut_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_cut','${column_name}','cut_id',${menu_id},'-1',${user_id},${session_id},1,0) as erptab (${column_with_type})  where cut_name='${cut_name}'`)

        if (query[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_cut',0, array[row('cut_name','${cut_name}'),row('is_active','${is_active}'),row('created_by','${user_id}'),row('created_date',current_timestamp) ]::typ_record[],1,'cut_id',1,1); commit;`)
            let cut_id = dataReponse[0][0].p_internal_id
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_cut',${cut_id},1,'cut_id'); commit;`)
            res.status(200).json({ data: "Record Inserted !", cut_id })
        }
        else {
            res.status(409).json({ data: "Record already exists !" })
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
            let { column_name, column_with_type } = await getCol("inv_cut", "cut_id", "N")
            query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_cut','${column_name}','cut_id',${menu_id},'-1',${user_id},${session_id},1,0,'GET_SETUP_DATA') as erptab (${column_with_type}) ORDER BY cut_name `);
            return res.status(200).send({ data: query[0] })
        }

        if (from === "items") {
            let sqleuery = "";
            sqleuery += " select cut_id,cut_name,is_active from inv_cut st ";
            sqleuery += "  where st.is_deleted=0 ";
            sqleuery += `  and exists(select '' from  admin_company_entity_access acea where acea.entity_id=10 and acea.entity_record_id=st.cut_id and acea.company_id=${company_id})  `;
            query = await sequelize.query(sqleuery)
            return query[0];
        }
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        let { column_name, column_with_type } = await getCol("inv_cut", "cut_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_cut','${column_name}','cut_id',2,'${id}',1,0) as erptab (${column_with_type}) `)
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
        let id = req.params.Id
        let { user_id, session_id } = req.user
        let { cut_name, is_active } = req.body
        let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'inv_cut',${id},array[
            row('cut_name','${cut_name}'),row('last_modified_by','${user_id}'),row('is_active','${is_active}'),row('last_modified_date',current_timestamp) ]::typ_record[],2,'cut_id',0,0); COMMIT;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_cut',${id},2,'cut_id'); commit;`)
        console.log("11")
        res.status(200).json({ data: "Record Updated Successfully!" })

    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.delete = async (req, res) => {
    try {
        let id = req.params.Id
        let { user_id, session_id } = req.user
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_cut',${id},3,'cut_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'inv_cut',${id}, null,3,'cut_id',0,0); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}