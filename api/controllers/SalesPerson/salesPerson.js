const { sequelize } = require("../../config/database")
const { getCol, dataFilter } = require("../../utils/helper");

exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { is_active, email } = req.body;
        let data = await dataFilter(req.body);
        is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
        data.push(`row('created_by',${user_id})`);
        data.push(`row('created_date',current_timestamp)`);
        let { column_name, column_with_type } = await getCol("scm_sales_person", "sales_person_id", "N");
        let isFined = await sequelize.query(`select ${column_name} from func_get_table_data('scm_sales_person','${column_name}','sales_person_id',2,'-1',1,1000) as erptab (${column_with_type})where email='${email}' `);

        if (isFined[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'scm_sales_person',0, array[${data}]::typ_record[],1,'sales_person_id',1,1); commit;`);
            let sales_person_id = dataReponse[0][0].p_internal_id;
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sales_person',${sales_person_id},1,'sales_person_id'); commit;`);
            res.status(200).json({ data: "Record Inserted !", sales_person_id })
        }
        else {
            res.status(409).json({ data: "User with this email already exists" })
        }
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("scm_sales_person", "sales_person_id", "N");
        let query = await sequelize.query(`select * from  func_get_salesperson_grid(${user_id},${session_id}) `)
        // let query = await sequelize.query(`select ${column_name} from func_get_table_data('scm_sales_person','${column_name}','sales_person_id',2,'-1',${user_id},${session_id},1,0,'GET_SETUP_DATA') as erptab (${column_with_type}) `)
        if (from === "saleOrder") {
            return query[0];
        }
        // select * from  func_get_salesperson_grid(1,1)
        res.status(200).send({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        const { user_id, session_id } = req.user
        let { column_name, column_with_type } = await getCol("scm_sales_person", "sales_person_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('scm_sales_person','${column_name}','sales_person_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
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
        const { user_id, session_id } = req.user;
        const { is_active } = req.body;
        let id = req.params.Id;
        let { column_name, column_with_type } = await getCol("scm_sales_person", "sales_person_id", "N");
        let data = await dataFilter(req.body);
        is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
        data.push(`row('last_updated_by',${user_id})`);
        data.push(`row('last_updated_date',current_timestamp)`);

        let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('scm_sales_person','${column_name}','sales_person_id',2,'${id}',1,0) as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No User Found !" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'scm_sales_person',${id},array[${data}]::typ_record[],2,'sales_person_id',0,0); COMMIT;`);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sales_person',${id},2,'sales_person_id'); commit;`)
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
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'scm_sales_person',${id}, null,3,'sales_person_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_sales_person',${id},3,'sales_person_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}