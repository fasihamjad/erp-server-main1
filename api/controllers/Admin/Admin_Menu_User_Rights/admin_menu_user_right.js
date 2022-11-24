const { sequelize } = require("../../../config/database")
const { getCol, dataFilter } = require("../../../utils/helper");


exports.create = async (req, res) => {
    try {
        let data = [];
        const { user_id, session_id } = req.user;
        const { admin_user_id, menu_id, can_view, can_delete, can_edit, can_add, can_print, is_select, menu_ids } = req.body;
        if (is_select) {
            menu_ids.forEach(async f => {
                let newData = [];
                admin_user_id && newData.push(`row('user_id','${admin_user_id}')`)
                newData.push(`row('menu_id', ${f})`)
                can_view ? newData.push(`row('can_view', 'true')`) : newData.push(`row('can_view', 'false')`)
                can_delete ? newData.push(`row('can_delete', 'true')`) : newData.push(`row('can_delete', 'false')`)
                can_edit ? newData.push(`row('can_edit', 'true')`) : newData.push(`row('can_edit', 'false')`)
                can_add ? newData.push(`row('can_add', 'true')`) : newData.push(`row('can_add', 'false')`)
                can_print ? newData.push(`row('can_print', 'true')`) : newData.push(`row('can_print', 'false')`)
                newData.push(`row('created_by','${user_id}')`)
                newData.push(`row('created_date',current_timestamp)`)
                let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'admin_menu_user_rights',0, array[${newData}]::typ_record[],1,'user_rights_id',1,1); commit;`)
                let user_rights_id = dataReponse[0][0].p_internal_id
                let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu_user_rights',${user_rights_id},1,'user_rights_id'); commit;`)
            })
            return res.status(200).json({ data: "Record Inserted !" })
        } else {
            admin_user_id && data.push(`row('user_id','${admin_user_id}')`)
            menu_id && data.push(`row('menu_id', ${menu_id})`)
            can_view ? data.push(`row('can_view', 'true')`) : data.push(`row('can_view', 'false')`)
            can_delete ? data.push(`row('can_delete', 'true')`) : data.push(`row('can_delete', 'false')`)
            can_edit ? data.push(`row('can_edit', 'true')`) : data.push(`row('can_edit', 'false')`)
            can_add ? data.push(`row('can_add', 'true')`) : data.push(`row('can_add', 'false')`)
            can_print ? data.push(`row('can_print', 'true')`) : data.push(`row('can_print', 'false')`)
            data.push(`row('created_by','${user_id}')`)
            data.push(`row('created_date',current_timestamp)`)
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'admin_menu_user_rights',0, array[${data}]::typ_record[],1,'user_rights_id',1,1); commit;`)
            let user_rights_id = dataReponse[0][0].p_internal_id
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu_user_rights',${user_rights_id},1,'user_rights_id'); commit;`)
            return res.status(200).json({ data: "Record Inserted !", user_rights_id })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("admin_menu_user_rights", `cast ( concat(20,8) as integer)`, "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_menu_user_rights','${column_name}','concat(user_id,menu_id)',2,'2012',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
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
        let { menu_id, can_view, can_delete, can_edit, can_add, can_print, created_by } = req.body
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'admin_menu_user_rights',${id}, array[row('menu_id','${menu_id}'),row('user_id','${user_id}'),row('can_view','${can_view}'),row('can_delete','${can_delete}'),row('can_edit','${can_edit}'),row('can_add','${can_add}'),row('can_print','${can_print}'),row('created_by','${created_by}'),row('created_date',current_timestamp) ]::typ_record[],2,'user_rights_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu_user_rights',${id},2,'user_rights_id'); commit;`)
        res.status(200).json({ data: "Record Updated Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.delete = async (req, res) => {
    try {
        let { user_id, session_id } = req.user
        let id = req.params.Id
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu_user_rights',${id},3,'user_rights_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_menu_user_rights',${id}, null,3,'user_rights_id',0,0); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

exports.getUserRights = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { menu_id, admin_user_id } = req.body;
        let { column_name, column_with_type } = await getCol("admin_menu_user_rights", `cast ( concat(${user_id},${menu_id}) as integer)`, "N")
        let dataReponse = await sequelize.query(`call proc_get_table_column('admin_menu_user_rights','cast ( concat(${user_id},${menu_id}) as integer)','N','','1')`)
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_menu_user_rights','${column_name}','concat(user_id,menu_id)',2,'${user_id}${menu_id}',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
        res.status(200).json(query[0][0])

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getUserRightsAll = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { module_id, admin_user_id } = req.body;
        let query = await sequelize.query(`
        select  coalesce(ur.user_id,${admin_user_id}) user_id,
        ur.user_rights_id,
		am.menu_id,
		am.menu_name,
		coalesce(ur.can_view,false) can_view,
		coalesce(ur.can_delete,false)can_delete,
		coalesce(ur.can_edit,false)can_edit,
		coalesce(ur.can_add,false) can_add,
		coalesce(ur.can_print,false)can_print,
		coalesce(ur.user_id,-1) is_add
        from admin_menu am
		left outer join
		admin_menu_user_rights ur
		on am.menu_id=ur.menu_id
		and ur.useR_id=${admin_user_id}
        where am.menu_type_id=3 and  am.is_active=true and am.module_id=${module_id} order by menu_name ASC 
        `)
        res.status(200).json(query[0])

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.saveUserRights = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        let { data } = req.body;
        data.forEach(async (userRight, index) => {
            let updateData = [];
            let saveData = [];

            if (userRight.is_add === -1) {
                saveData.push(`row('user_id','${userRight.user_id}')`)
                saveData.push(`row('menu_id', ${userRight.menu_id})`)
                saveData.push(`row('can_view', ${userRight.can_view})`)
                saveData.push(`row('can_delete', ${userRight.can_delete})`)
                saveData.push(`row('can_edit', ${userRight.can_edit})`)
                saveData.push(`row('can_add', ${userRight.can_add})`)
                saveData.push(`row('can_print', ${userRight.can_print})`)
                saveData.push(`row('created_by','${user_id}')`)
                saveData.push(`row('created_date',current_timestamp)`);
                let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_menu_user_rights',0, array[${saveData}]::typ_record[],1,'user_rights_id',1,1); commit;`)
                let user_rights_id = dataReponse[0][0].p_internal_id;
                let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu_user_rights',${user_rights_id},1,'user_rights_id'); commit;`);
            }

            if (userRight.is_add !== -1) {
                updateData.push(`row('can_view', ${userRight.can_view})`)
                updateData.push(`row('can_delete', ${userRight.can_delete})`)
                updateData.push(`row('can_edit', ${userRight.can_edit})`)
                updateData.push(`row('can_add', ${userRight.can_add})`)
                updateData.push(`row('can_print', ${userRight.can_print})`)
                updateData.push(`row('last_modified_by','${user_id}')`)
                updateData.push(`row('last_modified_date',current_timestamp)`)
                let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_menu_user_rights',${userRight.user_rights_id}, array[${updateData}]::typ_record[],2,'user_rights_id',0,0); commit;`)
                let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu_user_rights',${userRight.user_rights_id},2,'user_rights_id'); commit;`);
            }
        })
        res.status(200).send({ data: "Success!" })

    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}