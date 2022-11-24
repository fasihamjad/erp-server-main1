const { sequelize } = require("../../config/database")
const { getCol } = require("../../utils/helper");

//Style Start
exports.create = async (req, res) => {
    try {
        let { user_id, session_id } = req.user
        let { style_name, is_active, menu_id } = req.body

        //check record exists
        let { column_name, column_with_type } = await getCol("inv_style", "style_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_style','${column_name}','style_id',${menu_id},'-1',${user_id},${session_id},1,0) as erptab (${column_with_type})  where style_name='${style_name}'`)
        if (query[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_style',0, array[row('style_name','${style_name}'),row('is_active','${is_active}'),row('created_by','${user_id}'),row('created_date',current_timestamp) ]::typ_record[],1,'style_id',1,1); commit;`)
            let style_id = dataReponse[0][0].p_internal_id;
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_style',${style_id},1,'style_id'); commit;`)
            return res.status(200).json({ data: "Record Inserted !", style_id })
        }
        else {
            res.status(409).json({ data: "Record already exists !" })
        }

    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.getAllStyle = async (req, res, from) => {
    try {
        let { session_id, user_id } = req.user;
        let { menu_id, company_id } = req.body;
        let query;

        if (from !== "items") {
            let { column_name, column_with_type } = await getCol("inv_style", "style_id", "N");
            query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_style','${column_name}','style_id',${menu_id},'-1','${user_id}','${session_id}',1,0,'GET_SETUP_DATA') as erptab (${column_with_type}) ORDER BY style_name `)
            return res.status(200).json({ data: query[0] })
        }

        if (from === "items") {
            let sqleuery = "";
            sqleuery += " select style_id,style_name,is_active from inv_style st ";
            sqleuery += "  where st.is_deleted=0 ";
            sqleuery += `  and exists(select '' from  admin_company_entity_access acea where acea.entity_id=9 and acea.entity_record_id=st.style_id and acea.company_id=${company_id})  `;
            query = await sequelize.query(sqleuery)
            return query[0];
        }
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        let { column_name, column_with_type } = await getCol("inv_style", "style_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_style','${column_name}','style_id',2,'${id}',1,1000) as erptab (${column_with_type})  `)
        if (query[1].rowCount === 0) {
            res.status(208).json({ data: "No record found !" })
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
        let { user_id, session_id } = req.user
        let { style_name, is_active } = req.body
        let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'inv_style',${id},array[row('style_name','${style_name}'),row('is_active','${is_active}'),row('last_modified_by','${user_id}'),row('last_modified_date',current_timestamp) ]::typ_record[],2,'style_id',0,0); COMMIT;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_style',${id},2,'style_id'); commit;`)
        res.status(200).json({ data: "Record Updated Successfully!" })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.delete = async (req, res) => {
    try {
        let id = req.params.Id
        let { user_id, session_id } = req.user
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_style',${id}, null,3,'style_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_style',${id},3,'style_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
//Style End


//company access grid Start
exports.createCompanyAccess = async (req, res) => {

    try {
        let { user_id, session_id } = req.user
        let { is_active, form_id, company_id, menu_id } = req.body
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_company_entity_access',0, array[row('entity_id',${menu_id}),row('is_active','${is_active}'),row('created_by','${user_id}'),row('created_date',current_timestamp),row('entity_record_id',${form_id}),row('company_id',${company_id}) ]::typ_record[],1,'company_entity_access_id',1,1); commit;`)
        let styleid = dataReponse[0][0].p_internal_id
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_company_entity_access',${styleid},1,'company_entity_access_id'); commit;`)
        res.status(200).json({ data: "Record Inserted !", p_internal_id: dataReponse[0] })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.getCompanyAccessGrid = async (req, res) => {
    try {
        let { session_id, user_id, } = req.user;
        let { form_id, menu_id } = req.body;

        let { column_name, column_with_type } = await getCol("admin_company_entity_access", "company_entity_access_id", "N");
        let query = await sequelize.query(`select func_get_value_by_id('admin_company', 'company_id', 'company_name', company_id::character varying) as company_name, ${column_name} from func_get_table_data('admin_company_entity_access','${column_name}','entity_record_id',${menu_id},'${form_id}',${user_id},${session_id},1,1000,'ALLOWED_COMPANIES_ENTITY_WISE')  as erptab (${column_with_type}) ORDER BY company_id ASC`)
        res.status(200).json({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.deleteCompanyAccess = async (req, res) => {
    try {
        let id = req.params.Id
        let { session_id, user_id } = req.user;
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_company_entity_access',${id},3,'company_entity_access_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'admin_company_entity_access',${id}, null,3,'company_entity_access_id',0,0); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.updateCompanyAccessGrid = async (req, res) => {
    try {
        let id = req.params.Id
        let { user_id, session_id } = req.user
        let { is_active, company_id } = req.body
        let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'admin_company_entity_access',${id},array[row('company_id','${company_id}'),row('is_active','${is_active}'),row('last_modified_by','${user_id}'),row('last_modified_date',current_timestamp) ]::typ_record[],2,'company_entity_access_id',0,0); COMMIT;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_company_entity_access',${id},2,'company_entity_access_id'); commit;`)
        res.status(200).json({ data: "Record Updated Successfully!" })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
//company access grid End


//company access button click Start
exports.getCompanyAccessBtnClick = async (req, res) => {
    try {
        let { session_id, user_id } = req.user;
        let { column_name, column_with_type } = await getCol("admin_company", "company_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_company','${column_name}','company_id',2,'-1',${user_id},${session_id},1,0,'ALLOWED_COMPANIES')  as erptab (${column_with_type}) `)
        res.status(200).json({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
//company access button click End