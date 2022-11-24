const { sequelize } = require("../../../config/database");

exports.funcGetSaleComparisonReport = async (req, res) => {
    try {
      
      const { cy_start_date, cy_end_date, ly_start_date, ly_end_date, customer_type_id, region_id, sales_person_id, gender_id} = req.body;

      if (new Date(cy_start_date) > new Date(cy_end_date))
        return res.status(400).json({ data: "Start date cannot be greater than End date" });

        let query = await sequelize.query(
        `select * from func_get_sale_comparison_report('${cy_start_date}', '${cy_end_date}', '${ly_start_date}', '${ly_end_date}', ${customer_type_id},${region_id},${sales_person_id},${gender_id})`
      );
  
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };

  exports.test = async (req, res) => {
    try {
      
      await sequelize.authenticate();
      // console.log("test")
      
      res.status(200).send("test");
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };

  exports.test2 = async (req, res) => {
    try {
      
      await sequelize.authenticate();
      // console.log("test2")
      
      res.status(200).send("test2");
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };