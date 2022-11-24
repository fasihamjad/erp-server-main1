const { sequelize } = require("../../config/database");
const { getCol } = require("../../utils/helper");

exports.getAll = async (req, res) => {
    try {
        const { user_id } = req.user;
        let query = await sequelize.query(`select * from func_get_user_defualt_company(${user_id})`)
        res.status(200).send(query[0][0])
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}


exports.getOne = async (req, res) => {
    try {
        const { Id } = req.params
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("admin_company", "company_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('admin_company','${column_name}','company_id',2,'${Id}',${user_id},${session_id},1,0 ,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
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