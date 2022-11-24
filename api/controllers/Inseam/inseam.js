const { sequelize } = require("../../config/database");
const { getCol, dataFilter } = require("../../utils/helper");
//CRUD Operations
exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user
        const { is_active, inseam_name, menu_id } = req.body;
        let data = await dataFilter(req.body);
        is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
        data.push(`row('created_by',${user_id})`);
        data.push(`row('is_deleted',0)`)
        data.push(`row('created_date',current_timestamp)`)
        let { column_name, column_with_type } = await getCol("inv_inseam", "inseam_id", "N");
        let isFined = await sequelize.query(`select ${column_name} from func_get_table_data('inv_inseam','${column_name}','inseam_id',${menu_id},'-1',${user_id},${session_id},1,0) as erptab (${column_with_type}) where inseam_name='${inseam_name}' `);

        if (isFined[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_inseam',0, array[${data}]::typ_record[],1,'inseam_id',1,1); commit;`);
            let inseam_id = dataReponse[0][0].p_internal_id;
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_inseam',${inseam_id},1,'inseam_id'); commit;`);
            res.status(200).json({ data: "Record Inserted !", inseam_id })
        }
        else {
            res.status(409).json({ data: "Inseam already exists" })
        }
    }
    catch (err) {
        console.log("err", err)
        res.status(400).send(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        let { session_id, user_id } = req.user;
        let { menu_id } = req.body;

        let { column_name, column_with_type } = await getCol("inv_inseam", "inseam_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_inseam','${column_name}','inseam_id',${menu_id},'-1',${user_id},${session_id},1,0,'GET_SETUP_DATA') as erptab (${column_with_type}) ORDER BY seq DESC`);
        if (from === "items") {
            return query[0]
        }
        res.status(200).send({ data: query[0] })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        let { column_name, column_with_type } = await getCol("inv_inseam", "inseam_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_inseam','${column_name}','inseam_id',2,'${id}',1,0) as erptab (${column_with_type}) `)
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
        const { user_id, session_id } = req.user
        const { is_active, inseam_name } = req.body;
        let id = req.params.Id;

        let data = await dataFilter(req.body);
        is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
        data.push(`row('last_updated_by',${user_id})`);
        data.push(`row('last_updated_date',current_timestamp)`)

        let { column_name, column_with_type } = await getCol("inv_inseam", "inseam_id", "N");
        let isFined = await sequelize.query(`select ${column_name} from func_get_table_data('inv_inseam','${column_name}','inseam_id',2,'${id}',${user_id},${session_id},1,0) as erptab (${column_with_type}) `)

        if (isFined[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found !" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'inv_inseam',${id},array[${data}]::typ_record[],2,'inseam_id',0,0); COMMIT;`);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_inseam',${id},2,'inseam_id'); commit;`)
            res.status(200).json({ data: "Record Updated Successfully!" })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.delete = async (req, res) => {
    try {

        let id = req.params.Id;
        let { user_id, session_id } = req.user
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_inseam',${id},3,'inseam_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'inv_inseam',${id}, null,3,'inseam_id',0,0); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })

    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

