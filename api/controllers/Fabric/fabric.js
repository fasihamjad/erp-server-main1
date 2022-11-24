const { sequelize } = require("../../config/database")
const { getCol } = require("../../utils/helper");

exports.create = async (req, res) => {
    try {
        let { user_id, session_id } = req.user;
        let { fabric_name, fabric_class_id1, fabric_class_id2, fabric_type_id, fabric_useable_id, fabric_composition_id, is_active, menu_id } = req.body;
        console.log("fabric_class_id1", fabric_class_id1)
        console.log("fabric_class_id2", fabric_class_id2)
        console.log("fabricTypeID", fabric_type_id)
        console.log("fabric_useable_id", fabric_useable_id)
        console.log("fabric_composition_id", fabric_composition_id)
        console.log("fabric_name", fabric_name)
        console.log("is_active", is_active)


        let { column_name, column_with_type } = await getCol("inv_fabric", "fabric_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_fabric','${column_name}','fabric_id',${menu_id},'-1',${user_id},${session_id},1,0) as erptab (${column_with_type})  where fabric_name='${fabric_name}'`)
        if (query[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_fabric',0, array[row('fabric_name','${fabric_name}'),row('fabric_class_id1','${fabric_class_id1}'),row('fabric_class_id2','${fabric_class_id2}'),row('fabric_type_id','${fabric_type_id}'),row('fabric_useable_id','${fabric_useable_id}'),row('fabric_composition_id','${fabric_composition_id}'),row('is_active','${is_active}'),row('created_by','${user_id}'),row('created_date',current_timestamp) ]::typ_record[],1,'fabric_id',1,1); commit;`)
            let fabric_id = dataReponse[0][0].p_internal_id
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_fabric',${fabric_id},1,'fabric_id'); commit;`)
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

exports.getAll = async (req, res, from) => {
    try {
        let { session_id, user_id } = req.user;
        let { menu_id } = req.body;
        let query

        if (from === "items") {
            let sqleuery = "";
            sqleuery += " select fabric_id,fabric_name,is_active from inv_fabric st ";
            sqleuery += "  where st.is_deleted=0";
            query = await sequelize.query(sqleuery)
            return query[0]
        }
        if (from !== "items") {
            let { column_name, column_with_type } = await getCol("inv_fabric", "fabric_id", "N")
            query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_fabric','${column_name}','fabric_id',${menu_id},'-1','${user_id}','${session_id}',1,0,'GET_SETUP_DATA') as erptab (${column_with_type}) ORDER BY fabric_name`)
            res.status(200).json({ data: query[0] })
        }
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        console.log("id", id)
        let { column_name, column_with_type } = await getCol("inv_fabric", "fabric_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_fabric','${column_name}','fabric_id',2,'${id}',1,1000) as erptab (${column_with_type}) `)
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
        let { fabric_name, fabric_class_id1, fabric_class_id2, fabric_type_id, fabric_useable_id, fabric_composition_id, is_active, menu_id } = req.body;
        let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'inv_fabric',${id},array[row('fabric_name','${fabric_name}'),row('fabric_class_id1','${fabric_class_id1}'),row('fabric_class_id2','${fabric_class_id2}'),row('fabric_type_id','${fabric_type_id}'),row('fabric_useable_id','${fabric_useable_id}'),row('fabric_composition_id','${fabric_composition_id}'),row('is_active','${is_active}'),row('last_modified_by','${user_id}'),row('last_modified_date',current_timestamp) ]::typ_record[],2,'fabric_id',0,0); COMMIT;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_fabric',${id},2,'fabric_id'); commit;`)
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
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_fabric',${id},3,'fabric_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_fabric',${id}, null,3,'fabric_id',0,0); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}