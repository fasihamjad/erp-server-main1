const { sequelize } = require("../../config/database")
const { getCol, dataFilter } = require("../../utils/helper");
const sha1 = require('sha1');

exports.getAll = async (req, res) => {
    try {
        let { session_id, user_id } = req.user;
        let { column_name, column_with_type } = await getCol("admin_user", "user_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_user','${column_name}','user_id',2,'-1','${user_id}','${session_id}',1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) order by user_id desc`)
        res.status(200).json({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getUserType = async (req, res) => {
    try {
        let { user_id } = req.user;
        console.log(user_id,"uid");
        let query = await sequelize.query(`select coalesce(user_type,'PAK') from admin_user where user_id=${user_id}`)
        res.status(200).json({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getOne = async (req, res) => {
    try {
        let id = req.params.Id;
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("admin_user", "user_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_user','${column_name}','user_id',2,'${id}',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
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
        const { user_id, session_id } = req.user;
        const { user_password } = req.body
        let data = await dataFilter(req.body);
        data.push(`row('last_updated_by',${user_id})`);
        data.push(`row('last_updated_date',current_timestamp)`);
        user_password && data.push(`row('user_password','${sha1(user_password)}')`);

        let id = req.params.Id;
        let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'admin_user',${id},array[${data}]::typ_record[],2,'user_id',0,0); COMMIT;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_user',${id},2,'user_id'); commit;`)
        res.status(200).json({ data: "Record Updated Successfully!" })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.delete = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        let id = req.params.Id;
        let { column_name, column_with_type } = await getCol("admin_user", "user_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_user','${column_name}','user_id',2,'${id}',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
        if (query[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found !" })
        }
        else {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_user',${id}, null,3,'user_id',0,0); commit;`)
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_user',${id},2,'user_id'); commit;`)
            res.status(200).json({ data: "Record Deleted Successfully!" })
        }

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
