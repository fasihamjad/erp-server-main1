const { sequelize } = require("../../../config/database")
const { getCol, dataFilter } = require("../../../utils/helper");

exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        let query;
        if (from === "saleOrder") {
            let sqleuery = "";
            sqleuery += " select term_id,term_name,is_active,factor_id from scm_term_for_print st ";
            sqleuery += "  where st.is_deleted=0 and st.is_Active=true  ";
            query = await sequelize.query(sqleuery)
            return query[0]
        } else {
            let { column_name, column_with_type } = await getCol("scm_term_for_print", "term_id", "N");
            query = await sequelize.query(`select ${column_name} from func_get_table_data('scm_term_for_print','${column_name}','term_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
            res.status(200).send({ data: query[0] })
        }

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}