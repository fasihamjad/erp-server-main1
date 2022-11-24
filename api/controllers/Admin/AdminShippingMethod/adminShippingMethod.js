const { sequelize } = require("../../../config/database")
const { getCol, dataFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { is_active, shipping_method_name } = req.body;
        let data = await dataFilter(req.body);
        is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
        data.push(`row('created_by',${user_id})`);
        data.push(`row('created_date',current_timestamp)`);
        data.push(`row('is_deleted',0)`);

        let { column_name, column_with_type } = await getCol("admin_shipping_method", "shipping_method_id", "N");
        let isFined = await sequelize.query(`select ${column_name} from func_get_table_data('admin_shipping_method','${column_name}','shipping_method_id',2,'-1',${user_id},${session_id},1,0) as erptab (${column_with_type}) where shipping_method_name='${shipping_method_name}' `);

        if (isFined[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_shipping_method',0, array[${data}]::typ_record[],1,'shipping_method_id',1,1); commit;`);
            let shipping_method_id = dataReponse[0][0].p_internal_id;
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_shipping_method',${shipping_method_id},1,'shipping_method_id'); commit;`);
            res.status(200).json({ data: "Record Inserted !", shipping_method_id })
        }
        else {
            res.status(409).json({ data: "Shipping method  already exists" })
        }
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        let query;
        if (from === "saleOrder") {
            let sqleuery = "";
            sqleuery += " select shipping_method_id,shipping_method_name,is_active from admin_shipping_method st ";
            sqleuery += "  where st.is_deleted=0 and st.is_Active=true  ";
            query = await sequelize.query(sqleuery)
            return query[0]

        } else {
            let { column_name, column_with_type } = await getCol("admin_shipping_method", "shipping_method_id", "N");
            query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_shipping_method','${column_name}','shipping_method_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
            return res.status(200).send({ data: query[0] })
        }

    }
    catch (err) {
        console.log("file: adminShippingMethod.js ~ line 50 ~ err", err);
        res.status(400).json(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("admin_shipping_method", "shipping_method_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_shipping_method','${column_name}','shipping_method_id',2,'${id}',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
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
        let { column_name, column_with_type } = await getCol("admin_shipping_method", "shipping_method_id", "N");
        let data = await dataFilter(req.body);
        is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
        data.push(`row('last_modified_by',${user_id})`);
        data.push(`row('last_modified_date',current_timestamp)`);

        let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('admin_shipping_method','${column_name}','shipping_method_id',2,'${id}',${user_id},${session_id},1,0) as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No User Found !" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'admin_shipping_method',${id},array[${data}]::typ_record[],2,'shipping_method_id',0,0); COMMIT;`);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_shipping_method',${id},2,'shipping_method_id'); commit;`)
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
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_shipping_method',${id}, null,3,'shipping_method_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_shipping_method',${id},3,'shipping_method_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}