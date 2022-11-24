const { sequelize } = require("../../config/database");
const { getCol, boolFilter } = require("../../utils/helper");

exports.create = async (req, res) => {
    try {
        const { user_id, session_id, } = req.user
        const { customer_id } = req.body;
        // console.log({ file: req.file })
        let originalName = req.file.filename;
        // let file = { ...req.file, originalname: originalName }
        // console.log("originalName", originalName)
        let boolData = await boolFilter(req.body);
        boolData.push(`row('created_by',${user_id})`)
        boolData.push(`row('created_date',current_timestamp)`)
        boolData.push(`row('is_deleted',0)`)
        boolData.push(`row('physical_file','')`)
        boolData.push(`row('physical_file_name','${originalName}')`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id}, 'scm_customer_communication',0, array[${boolData}]::typ_record[],1,'customer_communication_id',1,1); commit;`)
        let customer_communication_id = dataReponse[0][0].p_internal_id;
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_customer_communication',${customer_communication_id},1,'customer_communication_id'); commit;`);
        res.status(200).json({ data: "Record Inserted !", customer_communication_id })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getAll = async (req, res, from) => {
    try {
        const id = req.params.Id;
        const { user_id, session_id } = req.user;
        // let { column_name, column_with_type } = await getCol("scm_customer_communication", "customer_communication_id", "N");
        let query = await sequelize.query(`SELECT * FROM func_get_customer_communication_grid(${id},${user_id},${session_id}) `)
        res.status(200).send({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        const { user_id, session_id } = req.user;
        // let { column_name, column_with_type } = await getCol("scm_customer_bill_to", "customer_bill_to_id", "Y")
        console.log('this is log');
        let query = await sequelize.query(`SELECT * FROM func_get_customer_communication_grid(${id},${user_id},${session_id}) `)
        // func_get_customer_communication_grid(
        //     p_customer_id integer,
        //     p_user_id integer,
        //     p_session_id integer
        console.log('this is log-end');
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