const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { refund_date, gl_period_id, reference_no, account_id, customer_id, memo, company_id } = req.body;
      let data = await boolFilter(req.body);
      data.push(`row('created_by',${user_id})`);
      data.push(`row('created_date',current_timestamp)`);
      data.push(`row('is_deleted',0)`);

      let RefundHeaderNo = await sequelize.query(
        `SELECT COALESCE(MAX(CAST (refund_header_no as numeric)),0)+1 as refund_header_no from ar_customer_refund_header where company_id=${company_id}`
      );
      data.push(`row('refund_header_no',${RefundHeaderNo[0][0].refund_header_no})`);

      let response = await sequelize.query(
        `begin; call proc_erp_crud_operations(${user_id},${session_id},'ar_customer_refund_header',0, array[${data}]::typ_record[],1,'refund_header_id',1,1); commit;`
      );

      let refund_header_id = response[0][0].p_internal_id;
      let query = await sequelize.query(
        `begin; call proc_generate_record_log(${user_id},${session_id},'ar_customer_refund_header',${refund_header_id},1,'refund_header_id'); commit;`
      );

      let saveQuantity = await sequelize.query(
        `begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${refund_header_id},'CUSTOMERREFUND'); commit;`
      );
      
      res.status(200).json({ data: "Record Inserted !", refund_header_id, refund_header_no:RefundHeaderNo[0][0].refund_header_no });
    } catch (err) {
      res.status(400).json(err.stack);
    }
};

exports.getAll = async (req, res, from) => {
    try {
      const { user_id, session_id } = req.user;
      const { fromDate , toDate  } = req.body;
      if (new Date(fromDate) > new Date(toDate))
        return res
          .status(400)
          .json({ data: "Start date cannot be greater than End date" });
      let query = await sequelize.query(
        `select * from func_get_ar_customer_refund_grid(null,'${fromDate}','${toDate}',${user_id},${session_id}) order by refund_header_id desc `
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };

  exports.getOne = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const refund_header_id = req.params.Id;
      let query = await sequelize.query(
        `select * from func_get_ar_customer_refund_grid(${refund_header_id},null,null,${user_id},${session_id})`
      );
      if (query[1].rowCount === 0) {
        return res.status(404).json({ data: "No Record Found !" });
      } else {
        return res.status(200).json({ data: query[0] });
      }
    } catch (err) {
      res.status(400).send(err.stack);
    }
  };
  
  exports.update = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      let id = req.params.Id;
      let { column_name, column_with_type } = await getCol(
        "ar_customer_refund_header",
        "refund_header_id",
        "N"
      );
      let data = await boolFilter(req.body);
      data.push(`row('last_updated_by',${user_id})`);
      data.push(`row('last_updated_date',current_timestamp)`);
      let isExsist = await sequelize.query(
        `select ${column_name} from func_get_table_data('ar_customer_refund_header','${column_name}','refund_header_id',2,'${id}',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type})`
      );
      if (isExsist[1].rowCount === 0) {
        res.status(404).json({ data: "No Record Found!" });
      } else {
        dataReponse = await sequelize.query(
          `BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'ar_customer_refund_header',${id},array[${data}]::typ_record[],2,'refund_header_id',0,0); COMMIT;`
        );
        let logQuery = await sequelize.query(
          `begin; call proc_generate_record_log(${user_id},${session_id},'ar_customer_refund_header',${id},2,'refund_header_id'); commit;`
        );
        let saveQuantity = await sequelize.query(
          `begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'CUSTOMERREFUND'); commit;`
        );
        res.status(200).json({ data: "Record Updated Successfully!" });
      }
    } catch (err) {
      res.status(400).send(err.stack);
    }
  };
  exports.delete = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      let id = req.params.Id;
      let dataReponse = await sequelize.query(
        `begin; call proc_erp_crud_operations(${user_id},${session_id},'ar_customer_refund_header',${id}, null,3,'refund_header_id',0,0); commit;`
      );
      let logQuery = await sequelize.query(
        `begin; call proc_generate_record_log(${user_id},${session_id},'ar_customer_refund_header',${id},3,'refund_header_id'); commit;`
      );
      let saveQuantity = await sequelize.query(
        `begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'CUSTOMERREFUND'); commit;`
      );
      res.status(200).json({ data: "Record Deleted Successfully!" });
    } catch (err) {
      res.status(400).send(err.stack);
    }
  };

  exports.CustomerNoteForRefund = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { customer_id } = req.body;

      let query = await sequelize.query(
        `select * from func_get_ar_customer_note_for_refund(${customer_id},${user_id},${session_id})`
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  }; 