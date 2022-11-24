const { sequelize } = require("../../config/database");

exports.getAll = async (req, res) => {
    ///changes for get report IP from server
    try {
        const { user_id, session_id } = req.user;
        let query = await sequelize.query(`select * from func_get_report_server_ip(${user_id},${session_id})`)
        return res.status(200).send({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}