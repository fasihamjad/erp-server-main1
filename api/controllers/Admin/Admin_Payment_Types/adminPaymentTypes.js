const { sequelize } = require("../../../config/database");

exports.getAll = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        let query = await sequelize.query(`select * from admin_payment_type`);
        console.log(query)
        res.status(200).send({ data: query[0] });

    } catch (err) {
        res.status(400).json(err.stack);
    }
};
