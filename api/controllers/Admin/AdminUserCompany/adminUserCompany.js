const { sequelize } = require("../../../config/database")
const { getCol, boolFilter } = require("../../../utils/helper");


exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { is_default, company_id } = req.body;
        let { column_name, column_with_type } = await getCol("admin_user_company_access", "user_company_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_user_company_access','${column_name}','user_company_id',2,'-1',${user_id},${session_id},1,0) as erptab (${column_with_type})  where ( user_id='${req.body.user_id}' and company_id=${company_id})`)
        if (query[1].rowCount === 0) {
            if (is_default) {
                await sequelize.query(`UPDATE admin_user_company_access set is_default=false where user_id=${req.body.user_id} `)
            }
            let boolData = await boolFilter(req.body);
            boolData.push(`row('created_by',${user_id})`)
            boolData.push(`row('created_date',current_timestamp)`)
            boolData.push(`row('is_deleted',0)`)
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id}, 'admin_user_company_access',0, array[${boolData}]::typ_record[],1,'user_company_id',1,1); commit;`)
            let user_company_id = dataReponse[0][0].p_internal_id;
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_user_company_access',${user_company_id},1,'user_company_id'); commit;`);
            res.status(200).json({ data: "Record Inserted !", user_company_id })
        } else {
            res.status(400).send({ data: "User with this company already exists" })
        }

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("admin_user_company_access", "user_company_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_user_company_access','${column_name}','user_company_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) order by user_company_id desc`)
        if (from === "adminMenu") {
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
        let { column_name, column_with_type } = await getCol("admin_user_company_access", "user_company_id", "N")
        let query = await sequelize.query(`select *  from func_get_table_data('admin_user_company_access','${column_name}','user_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED')  as erptab (${column_with_type}) order by user_company_id desc`)
        if (query[1].rowCount === 0) {
            return res.status(404).json({ data: "No Record Found !" })
        }
        else {
            return res.status(200).json({ data: query[0] })
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
        const { is_default, } = req.body;

        if (!req.body.user_id) return res.status(400).send({ data: "userId cannot be empty" })

        if (is_default) {
            await sequelize.query(`UPDATE admin_user_company_access set is_default=false where user_id=${req.body.user_id} `)
        }
        let { column_name, column_with_type } = await getCol("admin_user_company_access", "user_company_id", "N");
        let boolData = await boolFilter(req.body);
        boolData.push(`row('last_modified_by',${user_id})`);
        boolData.push(`row('last_modified_date',current_timestamp)`);

        let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('admin_user_company_access','${column_name}','user_company_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED' ) as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found!" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id}, ${session_id},'admin_user_company_access',${id},array[${boolData}]::typ_record[],2,'user_company_id',0,0); COMMIT;`);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id}, ${session_id},'admin_user_company_access',${id},2,'user_company_id'); commit;`)
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
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_user_company_access',${id}, null,3,'user_company_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_user_company_access',${id},3,'user_company_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

