const { sequelize } = require("../../config/database")
const { getCol, dataFilter, boolFilter } = require("../../utils/helper");


exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { account_type_code } = req.body;
        let boolData = await boolFilter(req.body);
        boolData.push(`row('created_by',${user_id})`)
        boolData.push(`row('created_date',current_timestamp)`)
        boolData.push(`row('is_deleted',0)`)
        let { column_name, column_with_type } = await getCol("gl_account_type", "account_type_id", "N")
        let query = await sequelize.query(`select *  from func_get_table_data('gl_account_type','${column_name}','account_type_code',2,'${account_type_code}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED')  as erptab (${column_with_type})`);

        if (query[1].rowCount !== 0) return res.status(409).send({ data: "Account Type Code already exists" })

        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id}, 'gl_account_type',0, array[${boolData}]::typ_record[],1,'account_type_id',1,1); commit;`)
        let account_type_id = dataReponse[0][0].p_internal_id;
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'gl_account_type',${account_type_id},1,'account_type_id'); commit;`);
        return res.status(200).json({ data: "Record Inserted !", account_type_id })

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("gl_account_type", "account_type_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('gl_account_type','${column_name}','account_type_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) order by account_type_id desc`)
        if (from === "adminMenu" ) {
            return query[0]
        } else {
            return res.status(200).send({ data: query[0] })
        }

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("gl_account_type", "account_type_id", "N")
        let query = await sequelize.query(`select *  from func_get_table_data('gl_account_type','${column_name}','account_type_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED')  as erptab (${column_with_type})`)
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
        let id = req.params.Id;
        const { user_id, session_id } = req.user;
        const { account_type_code } = req.body;
        let { column_name, column_with_type } = await getCol("gl_account_type", "account_type_id", "N");
        let data = await dataFilter(req.body);
        let boolData = await boolFilter(req.body);
        boolData.push(`row('last_modified_by',${user_id})`);
        boolData.push(`row('last_modified_date',current_timestamp)`);

        let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('gl_account_type','${column_name}','account_type_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED' ) as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found!" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id}, ${session_id},'gl_account_type',${id},array[${boolData}]::typ_record[],2,'account_type_id',0,0); COMMIT;`);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id}, ${session_id},'gl_account_type',${id},2,'account_type_id'); commit;`)
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
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'gl_account_type',${id}, null,3,'account_type_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'gl_account_type',${id},3,'account_type_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

