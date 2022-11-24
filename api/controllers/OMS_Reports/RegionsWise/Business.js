const { sequelize } = require("../../../config/database");

exports.getBusinessDashboardReport = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    const {gender_id,region_id, company_id, customer_id, current_year, last_year } = req.body;
      let query = await sequelize.query(
      `select * from func_get_business_dashboard_report(${gender_id},${region_id},${company_id},${customer_id},${current_year},${last_year},${user_id},${session_id} )`
    );
    res.status(200).send({ data: query[0] });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

exports.getBusinessDashboardDetailReport = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { gender_id, region_id, year_id  } = req.body;
   
        let query = await sequelize.query(
        `select * from func_get_business_dashboard_detail_report('${year_id}',${gender_id},${region_id},${user_id},${session_id})`
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };