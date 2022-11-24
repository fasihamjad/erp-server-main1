const { sequelize } = require("../../../config/database");

exports.funcGetPaymentOmsReport = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { from_date, to_date, company_id } = req.body;
  
      if (new Date(from_date) > new Date(to_date))
        return res.status(400).json({ data: "Start date cannot be greater than End date" });
        let query = await sequelize.query(
        `select * from func_get_payment_oms_report('${from_date}','${to_date}',${user_id},${session_id},${company_id})`
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };

  exports.funcGetPaymentInvoiceOmsReport = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { payment_header_id } = req.body;
  
        let query = await sequelize.query(
        `select * from func_get_payment_invoice_oms_report(${payment_header_id},${user_id},${session_id})`
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };
  
  exports.funcGetCustomerPaymentLedgerReport = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { customer_id, from_date, to_date} = req.body;

      if(from_date > to_date)
        res.status(400).send({data: "Start date should not be greater then End date"});
      
        let query = await sequelize.query(
        `select * from func_get_customer_payment_ledger_report(${customer_id},'${from_date}','${to_date}',${user_id},${session_id})`
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };

