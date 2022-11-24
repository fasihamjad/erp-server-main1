const { sequelize } = require("../../../config/database")
const { getCol, dataFilter } = require("../../../utils/helper");

const getModule = require("../Admin_Module/admin_module");
const getMenuType = require("../Admin_Menu_Type/admin_menu_type");

exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { is_active } = req.body;
        let data = await dataFilter(req.body);
        is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`)
        data.push(`row('created_by',${user_id})`)
        data.push(`row('created_date',current_timestamp)`)
        data.push(`row('is_deleted',0)`)
        let { column_name, column_with_type } = await getCol("admin_menu", "menu_id", "N");
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id}, 'admin_menu',0, array[${data}]::typ_record[],1,'menu_id',1,1); commit;`)
        let menu_id = dataReponse[0][0].p_internal_id;
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu',${menu_id},1,'menu_id'); commit;`);
        res.status(200).json({ data: "Record Inserted !", menu_id })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("admin_menu", "menu_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_menu','${column_name}','menu_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) order by menu_id desc`)
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
        let { column_name, column_with_type } = await getCol("admin_menu", "menu_id", "Y")
        let query = await sequelize.query(`select *  from func_get_table_data('admin_menu','${column_name}','module_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED')  as erptab (${column_with_type}) where menu_type_id=3 `)
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
exports.getFormAdminMenu = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        let from = "adminMenu";
        let adminModule = await getModule.getAll(req, res, from);
        let adminMenuType = await getMenuType.getAll(req, res, from);
        let adminMenu = await this.getAll(req, res, from);
        return res.status(200).send({ adminMenuType, adminModule, adminMenu })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

exports.update = async (req, res) => {
    try {
        let id = req.params.Id;
        const { user_id, session_id } = req.user;
        const { is_active } = req.body;
        let { column_name, column_with_type } = await getCol("admin_menu", "menu_id", "N");
        let data = await dataFilter(req.body);
        is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
        data.push(`row('last_updated_by',${user_id})`);
        data.push(`row('last_updated_date',current_timestamp)`);

        let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('admin_menu','${column_name}','menu_id',2,'${id}',1,0) as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No Customer Found !" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id}, ${session_id},'admin_menu',${id},array[${data}]::typ_record[],2,'menu_id',0,0); COMMIT;`);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id}, ${session_id},'admin_menu',${id},2,'menu_id'); commit;`)
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
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_customer_bill_to',${id}, null,3,'customer_bill_to_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_customer_bill_to',${id},3,'customer_bill_to_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

exports.getOneBill = async (req, res) => {
    try {
        const id = req.params.Id;
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("scm_customer_bill_to", "customer_bill_to_id", "Y")
        let query = await sequelize.query(`select *  from func_get_table_data('scm_customer_bill_to','${column_name}','customer_bill_to_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED' )  as erptab (${column_with_type}) `)
        if (query[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found !" })
        }
        else {
            res.status(200).json({ data: query[0][0] })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

exports.delete = async (req, res) => {
    try {
        let { user_id, session_id } = req.user
        let id = req.params.Id
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu',${id},3,'menu_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_menu',${id}, null,3,'menu_id',0,0); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

exports.getParentMenu = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        const { module_id, menu_type_id } = req.body;
        let query = await sequelize.query(`select menu_id, menu_name from admin_menu where menu_type_id=${menu_type_id-1} AND module_id=${module_id}`)
        res.status(200).send(query[0])
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}