const { sequelize } = require("../../../config/database");
const { getCol } = require("../../../utils/helper");

exports.create = async (req, res) => {
    try {
        let { user_id, session_id, company_name, parent_company_id, website, mobile, fax, email, currency_id, registered_name, contact_person, ntn_no, is_active, created_by } = req.body
        let { column_name, column_with_type } = await getCol("admin_company", "company_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_company','${column_name}','company_id',2,'-1',${user_id},${session_id},1,0) as erptab (${column_with_type})  where company_name='${company_name}'`)
        if (query[1].rowCount === 0) {
            console.log("SSS")
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'admin_company',0, array[
                row('company_name','${company_name}'),
                row('parent_company_id','${parent_company_id}'),
                row('website','${website}'),
                row('mobile','${mobile}'),
                row('fax','${fax}'),
                row('email','${email}'),
                row('currency_id','${currency_id}'),
                row('registered_name','${registered_name}'),
                row('contact_person','${contact_person}'),
                row('ntn_no','${ntn_no}'),
                row('is_active','${is_active}'),
                row('created_by','${created_by}'),
                row('created_date',current_timestamp)
             ]::typ_record[],1,'company_id',1,1); commit;`)
            let company_id = dataReponse[0][0].p_internal_id
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_company',${company_id},1,'company_id'); commit;`)
            res.status(200).json({ data: "Record Inserted !", p_internal_id: dataReponse[0] })
        }
        else {
            res.status(200).json({ data: "Record already exists !" })
        }
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getAll = async (req, res) => {
    try {
        let { session_id, user_id } = req.body;
        let { column_name, column_with_type } = await getCol("admin_company", "company_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_company','${column_name}','company_id',2,'-1','${user_id}','${session_id}',1,1000,'ADMIN_COMPANY') as erptab (${column_with_type})`)
        res.status(200).json({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("admin_company", "company_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_company','${column_name}','company_id',2,'${id}',${user_id},${session_id},1,1000,'ADMIN_COMPANY') as erptab (${column_with_type})  `)
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
        let id = req.params.Id
        let { user_id, session_id, company_name, parent_company_id, website, mobile, fax, email, currency_id, registered_name, contact_person, ntn_no, created_by, is_active } = req.body
        let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'admin_company',${id}, array[row('company_name','${company_name}'),row('parent_company_id','${parent_company_id}'),row('website','${website}'),row('mobile','${mobile}'),row('fax','${fax}'),row('email','${email}'),row('currency_id','${currency_id}'),row('registered_name','${registered_name}'),row('contact_person','${contact_person}'),row('ntn_no','${ntn_no}'),row('is_active','${is_active}'),row('created_by','${created_by}'),row('created_date',current_timestamp) ]::typ_record[],2,'company_id',0,0); COMMIT;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_company',${id},2,'company_id'); commit;`)
        res.status(200).json({ data: "Record Updated Successfully!" })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }

}
exports.delete = async (req, res) => {
    try {
        let { user_id, session_id } = req.body
        let id = req.params.Id
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_company',${id},3,'company_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_company',${id}, null,3,'company_id',0,0); commit;`);
        res.status(200).json({ data: "Record Deleted Successfully!" });
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}