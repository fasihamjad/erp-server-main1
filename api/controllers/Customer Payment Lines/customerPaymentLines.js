const { sequelize } = require("../../config/database")
const { getCol } = require("../../utils/helper");


exports.getAll = async (req, res, from) => {
    try {
        let { session_id, user_id } = req.user;
        let { customer_id } = req.body;
        console.log("user", user_id)
        console.log("user", session_id)
        console.log("user", customer_id)
        let query = await sequelize.query(`select * from func_get_customer_invoice(${customer_id},${user_id},${session_id})`)
        res.status(200).json({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}