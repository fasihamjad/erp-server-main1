const { sequelize } = require("../../../config/database");

exports.funcGetSaleOrderDetailByPoOmsReport = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { po_no } = req.body;
  
        let query = await sequelize.query(
        `select * from func_get_sale_order_detail_by_po_oms_report('${po_no}',${user_id},${session_id})`
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };