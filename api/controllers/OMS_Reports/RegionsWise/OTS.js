const { sequelize } = require("../../../config/database");

exports.getOtsSummaryOmsReport = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { as_on_date, product_class_id, category_id , season_id, style_id, sort_on, sku, product_status_id, fit_category_id, include_bgrade } = req.body;
      
      let SKU = sku === null ? null : `'${sku}'`;
      let PRODUCT_CLASS_ID = product_class_id === null ? null : `'${product_class_id}'`;
      let SEASON_ID = season_id === null ? null : `'${season_id}'`;
      
        let query = await sequelize.query(
        `select * from func_get_ots_summary_oms_report('${as_on_date}',${PRODUCT_CLASS_ID},${category_id },${SEASON_ID},${style_id},'${sort_on}',${SKU},${product_status_id},${fit_category_id},'${include_bgrade}',${user_id},${session_id})`
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };
  
exports.getOtsDetailReport = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { as_on_date, item_id, gender_id, current_searon_id, fabric_id, gender_category_id, fit_category_id, style_id, wash_id, product_status_id, is_active,product_class_id } = req.body;
        let query = await sequelize.query(
        `select * from func_get_ots_detail_report('${as_on_date}',${item_id},${gender_id},${current_searon_id},${fabric_id},${gender_category_id},${fit_category_id},${style_id},${wash_id},${product_status_id},${is_active},'${product_class_id}',${user_id},${session_id})`
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };

