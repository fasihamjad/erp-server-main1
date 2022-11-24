const { sequelize } = require("../../config/database")
const { getCol, dataFilter, boolFilter } = require("../../utils/helper");

exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { pt_status_name } = req.body;
        let boolData = await boolFilter(req.body);
        boolData.push(`row('created_by',${user_id})`)
        boolData.push(`row('created_date',current_timestamp)`)
        boolData.push(`row('is_deleted',0)`)
        let { column_name, column_with_type } = await getCol("scm_pt_status", "pt_status_id", "N")
        let query = await sequelize.query(`select *  from func_get_table_data('scm_pt_status','${column_name}','pt_status_name',2,'${pt_status_name}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED')  as erptab (${column_with_type})`);

        if (query[1].rowCount !== 0) return res.status(409).send({ data: "Status Name already exists" })

        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id}, 'scm_pt_status',0, array[${boolData}]::typ_record[],1,'pt_status_id',1,1); commit;`)
        let pt_status_id = dataReponse[0][0].p_internal_id;
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_pt_status',${pt_status_id},1,'pt_status_id'); commit;`);
        return res.status(200).json({ data: "Record Inserted !", pt_status_id })

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        let query
        if (from === "saleOrder") {
            let sqleuery = "";
            sqleuery += " select pt_status_id,pt_status_name,is_active from scm_pt_status st ";
            sqleuery += "  where st.is_deleted=0 and st.is_Active=true  ";
            query = await sequelize.query(sqleuery)
            return query[0]
        } else {
            let { column_name, column_with_type } = await getCol("scm_pt_status", "pt_status_id", "N");
            query = await sequelize.query(`select ${column_name} from func_get_table_data('scm_pt_status','${column_name}','pt_status_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) order by pt_status_id desc`)
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
        let { column_name, column_with_type } = await getCol("scm_pt_status", "pt_status_id", "N")
        let query = await sequelize.query(`select *  from func_get_table_data('scm_pt_status','${column_name}','pt_status_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED')  as erptab (${column_with_type})`)
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
        let { column_name, column_with_type } = await getCol("scm_pt_status", "pt_status_id", "N");
        let data = await dataFilter(req.body);
        let boolData = await boolFilter(req.body);
        boolData.push(`row('last_updated_by',${user_id})`);
        boolData.push(`row('last_updated_date',current_timestamp)`);

        let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('scm_pt_status','${column_name}','pt_status_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED' ) as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found!" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id}, ${session_id},'scm_pt_status',${id},array[${boolData}]::typ_record[],2,'pt_status_id',0,0); COMMIT;`);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id}, ${session_id},'scm_pt_status',${id},2,'pt_status_id'); commit;`)
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
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_pt_status',${id}, null,3,'pt_status_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_pt_status',${id},3,'pt_status_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

