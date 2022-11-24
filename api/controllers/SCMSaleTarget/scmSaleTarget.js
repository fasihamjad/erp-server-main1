const { sequelize } = require("../../config/database")
const { getCol, boolFilter } = require("../../utils/helper");


exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        let boolData = await boolFilter(req.body);
        boolData.push(`row('created_by',${user_id})`)
        boolData.push(`row('created_date',current_timestamp)`)
        boolData.push(`row('is_deleted',0)`)

        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id}, 'scm_sales_target',0, array[${boolData}]::typ_record[],1,'target_id',1,1); commit;`)
        let target_id = dataReponse[0][0].p_internal_id;
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sales_target',${target_id},1,'target_id'); commit;`);
        return res.status(200).json({ data: "Record Inserted !", target_id })

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("scm_sales_target", "target_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('scm_sales_target','${column_name}','target_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) order by target_id desc`)
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
        let { column_name, column_with_type } = await getCol("scm_sales_target", "target_id", "N")
        let query = await sequelize.query(`select *  from func_get_table_data('scm_sales_target','${column_name}','target_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED')  as erptab (${column_with_type})`)
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
        let { column_name, column_with_type } = await getCol("scm_sales_target", "target_id", "N");
        let boolData = await boolFilter(req.body);
        boolData.push(`row('last_updated_by',${user_id})`);
        boolData.push(`row('last_updated_date',current_timestamp)`);

        let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('scm_sales_target','${column_name}','target_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED' ) as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found!" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id}, ${session_id},'scm_sales_target',${id},array[${boolData}]::typ_record[],2,'target_id',0,0); COMMIT;`);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id}, ${session_id},'scm_sales_target',${id},2,'target_id'); commit;`)
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
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_sales_target',${id}, null,3,'target_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sales_target',${id},3,'target_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

