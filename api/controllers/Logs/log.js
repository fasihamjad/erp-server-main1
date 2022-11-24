const { sequelize } = require("../../config/database")
const { getCol } = require("../../utils/helper");

exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user
        let newBody = Object.keys(req.body);
        let data = []
        
        for (let i = 0; i < newBody.length; i++) {
            data.push(`'${newBody[i]}'`)
        }
        console.log('pakistan zindabad',data)
        let { column_name, column_with_type } = await getCol("admin_system_information", "system_information_id", "N");
        let query = await sequelize.query(`select erptab.*,au.login_id,case when dml_action_id=1 then 'Add' when dml_action_id=2 then 'Update' else 'Delete' end action_name from  admin_user au,func_get_table_data('admin_system_information','${column_name}','system_information_id',2,'-1',${user_id},${session_id},1,0,'GET_SETUP_DATA') as erptab (${column_with_type}) ${newBody.length > 0 ? ` where au.user_id=erptab.user_id and entity_name in ( ${data} )` : ''}  ORDER BY record_id,entity_column_name,log_id`)
        // console.log("query result",column_name)
        res.status(200).send({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}