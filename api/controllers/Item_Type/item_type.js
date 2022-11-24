const { sequelize } = require("../../config/database")
const { getCol } = require("../../utils/helper");

exports.create = async (req, res) => {
    try {
        let { user_id, session_id } = req.user
        let { item_type_name, is_active, menu_id } = req.body

        let newBody = Object.keys(req.body);
        let newVal = Object.values(req.body);
        let data = [];
        for (let i = 0; i < newBody.length; i++) {
            console.log("typeof", newBody[i], typeof (newVal[i]))
            if ((typeof (newVal[i])) === 'string') {
                if (newVal[i] === "current_timestamp") {
                    data.push(`row('${newBody[i]}',${newVal[i]})`)
                } else if (newBody[i] === "menu_id") {
                } else {
                    data.push(`row('${newBody[i]}','${newVal[i]}')`)
                }
            }
        }
        data.push(`row('created_date',current_timestamp)`)
        data.push(`row('created_by',${user_id})`);

        is_active ? data.push(`row('is_active',true)`) : data.push(`row('is_active',false)`)

        console.log("data: ", data)
        let { column_name, column_with_type } = await getCol("inv_item_type", "item_type_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_item_type','${column_name}','item_type_id',${menu_id},'-1',1,1,1,0) as erptab (${column_with_type})  where item_type_name='${item_type_name}'`)
        if (query[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_item_type',0, array[${data}]::typ_record[],1,'item_type_id',1,1); commit;`)

            let item_type_id = dataReponse[0][0].p_internal_id
            //user and session id default
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_item_type',${item_type_id},1,'item_type_id'); commit;`)
            res.status(200).json({ data: "Record Inserted !", item_type_id })
        }
        else {
            res.status(200).json({ data: "Record already exists !" })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        let { session_id, user_id } = req.user;
        let { menu_id, company_id } = req.body;
        let query;

        if (from !== "items") {
            let { column_name, column_with_type } = await getCol("inv_item_type", "item_type_id", "N");
            query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_item_type','${column_name}','item_type_id',${menu_id},'-1','${user_id}','${session_id}',1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) ORDER BY  item_type_id DESC, created_date`)
            res.status(200).send({ data: query[0] })
        }
        if (from === "items") {
            let sqleuery = "";
            sqleuery += " select item_type_id,item_type_name,is_active from inv_item_type st ";
            sqleuery += "  where st.is_deleted=0 ";
            sqleuery += `  and exists(select '' from  admin_company_entity_access acea where acea.entity_id=22 and acea.entity_record_id=st.item_type_id and acea.company_id=${company_id})  `;
            query = await sequelize.query(sqleuery)
            // query = await sequelize.query(`select ${column_name} from func_get_table_data_by_company(${company_id},'inv_item_type','item_type_id','${column_name}',${user_id},${session_id},'MULTI_COMPANY') as erptab (${column_with_type}) ORDER BY item_type_name ASC `)
            return query[0];
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        let { column_name, column_with_type } = await getCol("inv_item_type", "item_type_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_item_type','${column_name}','item_type_id',2,'${id}',1,1000) as erptab (${column_with_type}) `)
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
        let id = req.params.Id
        let { user_id, session_id } = req.user
        let { item_type_name, is_active } = req.body
        let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'inv_item_type',${id},array[row('item_type_name','${item_type_name}'),row('is_active','${is_active}'),row('last_modified_by','${user_id}'),row('last_modified_date',current_timestamp) ]::typ_record[],2,'item_type_id',0,0); COMMIT;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_item_type',${id},2,'item_type_id'); commit;`)
        res.status(200).json({ data: "Record Updated Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.delete = async (req, res) => {
    try {
        let id = req.params.Id
        let { user_id, session_id } = req.user
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_item_type',${id},3,'item_type_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'inv_item_type',${id}, null,3,'item_type_id',0,0); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}