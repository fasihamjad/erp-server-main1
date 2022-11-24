const { sequelize } = require("../../config/database")
const sha1 = require('sha1');
const { getCol, dataFilter } = require("../../utils/helper");


exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { user_password, login_id } = req.body;
        let { column_name, column_with_type } = await getCol("admin_user", "user_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_user','${column_name}','login_id',2,'${login_id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
        if (query[1].rowCount === 0) {
            let data = await dataFilter(req.body);
            data.push(`row('created_by',${user_id})`)
            data.push(`row('created_date',current_timestamp)`)
            data.push(`row('is_lock','N')`)
            data.push(`row('user_password','${sha1(user_password)}')`)
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'admin_user',0, array[${data}]::typ_record[],1,'user_id',1,1); commit;`)
            let result = dataReponse[0][0].p_internal_id
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_user',${user_id},${session_id},'user_id'); commit;`)
            res.status(200).json("Record Inserted !")
        }
        else {
            return res.status(409).json({ data: "Login Id can not be same" })
        }

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}