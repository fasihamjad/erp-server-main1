const { sequelize } = require("../../../config/database")
const { getCol, dataFilter } = require("../../../utils/helper");

// exports.create = async (req, res) => {
//     try {
//         let { user_id, session_id } = req.user
//         let { menu_type_name, created_by } = req.body
//         let checkStyleAlreadyExist = await sequelize.query(`call proc_get_table_column('admin_menu_type','menu_type_id','','1')`)
//         let column_name = checkStyleAlreadyExist[0][0].p_column_name
//         let column_with_type = checkStyleAlreadyExist[0][0].p_column_with_type
//         let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_menu_type','${column_name}','menu_type_id',2,'-1',1,1000) as erptab (${column_with_type})  where menu_type_name='${menu_type_name}'`)
//         if (query[1].rowCount === 0) {
//             let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'admin_menu_type',0, array[row('menu_type_name','${menu_type_name}'),row('menu_type_id',1),row('created_by','${created_by}'),row('created_date',current_timestamp) ]::typ_record[],1,'menu_type_id',1,1); commit;`)
//             let menu_type_id = dataReponse[0][0].p_internal_id
//             let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu_type',${menu_type_id},1,'menu_type_id'); commit;`)
//             res.status(200).json({ data: "Record Inserted !", p_internal_id: dataReponse[0] })
//         }
//         else {
//             res.status(200).json({ data: "Record already exists !" })
//         }
//     }
//     catch (err) {
//         res.status(400).send(err.stack)
//     }
// }
exports.create = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
        let { is_active, menu_type_name} = req.body
		let data = await dataFilter(req.body);
        is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
		data.push(`row('created_by',${user_id})`);
		data.push(`row('created_date',current_timestamp)`);
		data.push(`row('is_deleted',0)`);
    let { column_name, column_with_type } = await getCol("admin_menu_type", "menu_type_id", "N");
		let isFined = await sequelize.query(
			`select ${column_name} from func_get_table_data('admin_menu_type','${column_name}','menu_type_id',2,'-1',${user_id},${session_id},1,0) as erptab (${column_with_type}) where menu_type_name='${menu_type_name}' `
		);

		if (isFined[1].rowCount === 0) {
			let dataReponse = await sequelize.query(
				`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_menu_type',0, array[${data}]::typ_record[],1,'menu_type_id',1,1); commit;`
			);
			let menu_type_id = dataReponse[0][0].p_internal_id;
			let logQuery = await sequelize.query(
				`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu_type',${menu_type_id},1,'menu_type_id'); commit;`
			);
			res.status(200).json({ data: "Record Inserted !", menu_type_id });
		} else {
			res.status(409).json({ data: "Record already exists" });
		}
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

exports.getAll = async (req, res, from) => {
    try {
        let { session_id, user_id } = req.user;
        let { column_name, column_with_type } = await getCol("admin_menu_type", "menu_type_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_menu_type','${column_name}','menu_type_id',2,'-1','${user_id}','${session_id}',1,0,'GET_SETUP_DATA') as erptab (${column_with_type})`)
        if (from === "adminMenu") {
            return query[0]
        } else {
            return res.status(200).json({ data: query[0] })
        }

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        let { column_name, column_with_type } = await getCol("admin_menu_type", "menu_type_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_menu_type','${column_name}','menu_type_id',2,'${id}',1,0) as erptab (${column_with_type})  `)
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
        let { is_active } = req.body
        let id = req.params.Id;
        let { column_name, column_with_type } = await getCol("admin_menu_type", "menu_type_id", "N");
        let data = await dataFilter(req.body);
        is_active ? data.push(`row('is_active','true')`) : data.push(`row('is_active','false')`);
        data.push(`row('last_updated_by',${user_id})`);
        data.push(`row('last_updated_date',current_timestamp)`);

        let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('admin_menu_type','${column_name}','menu_type_id',2,'${id}',${user_id},${session_id},1,0) as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No User Found !" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'admin_menu_type',${id},array[${data}]::typ_record[],2,'menu_type_id',0,0); COMMIT;`);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu_type',${id},2,'menu_type_id'); commit;`)
            res.status(200).json({ data: "Record Updated Successfully!" })
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
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'admin_menu_type',${id},3,'menu_type_id'); commit;`)
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'admin_menu_type',${id}, null,3,'menu_type_id',0,0); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}