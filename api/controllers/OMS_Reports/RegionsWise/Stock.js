const { sequelize } = require("../../../config/database");

exports.getStyleWiseStockReport = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { location_id, season_id, sku, style,pending_date,product_status_id } = req.body;

      let LOCATION_ID = location_id === null ? null : `'${location_id}'`;
      let SEASON_ID = season_id === null ? null : `'${season_id}'`;
      let SKU = sku===null ? null : `'${sku}'`
        let query = await sequelize.query(
          `select * from func_get_style_wise_stock_report(${LOCATION_ID},${user_id}, ${SKU},${style},'${pending_date}', ${product_status_id}, ${session_id},${SEASON_ID})`
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };