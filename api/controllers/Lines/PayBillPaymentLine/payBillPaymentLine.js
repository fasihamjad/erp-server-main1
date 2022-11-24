const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    let paymentlineid;
    if (req.body.data.length > 0) {
      let headerId;
      for (let i = 0; i < req.body.data.length; i++) {
        const newData = req.body.data.map(({ item_code, ...rest }) => ({ ...rest }));
        headerId = req.body.data[0].payment_header_id;
        let data = await boolFilter(newData[i]);
        data.push(`row('created_by',${user_id})`);
        data.push(`row('created_date',current_timestamp)`);
        data.push(`row('is_deleted',0)`);
        let dataReponse = await sequelize.query(
          `begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_bill_payment_lines',0, array[${data}]::typ_record[],1,'payment_line_id',1,1); commit;`
        );
        paymentlineid = dataReponse[0][0].p_internal_id;
        
        let logQuery = await sequelize.query(
          `begin; call proc_generate_record_log(${user_id},${session_id},'pay_bill_payment_lines',${paymentlineid},1,'payment_line_id'); commit;`
        );
      }
      let saveQuantity = await sequelize.query(
        `begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${headerId},'BILLPAY'); commit;`
      );
    }
    res.status(200).json({ data: "Record Inserted !", paymentlineid });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

exports.getAll = async (req, res, from) => {
  try {
    const { user_id, session_id } = req.user;
    let query;
    let { column_name, column_with_type } = await getCol( "pay_bill_payment_lines", "payment_line_id", "N");
    query = await sequelize.query(
      `select ${column_name} from func_get_table_data('pay_bill_payment_lines','${column_name}','payment_line_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `
    );
    res.status(200).send({ data: query[0] });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

exports.getOne = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;

    const payment_header_id = req.params.Id;
    let newQuery = await sequelize.query(
      `select * from func_get_bill_payment_lines_grid(${payment_header_id}, ${user_id}, ${session_id})`
    );
    if (newQuery[1].rowCount === 0) {
      return res.status(404).json({ data: "No Record Found !" });
    } else {
      return res.status(200).json({ data: newQuery[0] });
    }
  } catch (err) {
    res.status(400).send(err.stack);
  }
};

exports.update = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    let paymentHeaderId = req.params.Id;
    let id;
    if (req.body.data.length > 0) {
      for (let i = 0; i < req.body.data.length; i++) {
        id = req.body.data[i].payment_line_id;
        let data = await boolFilter(req.body.data[i]);
        // data.push(`row('last_updated_by',${user_id})`);
        // data.push(`row('last_updated_date',current_timestamp)`);
        // console.log("data", id, data);
        let dataReponse = await sequelize.query(
          `BEGIN; call proc_erp_crud_operations(1,1,'pay_bill_payment_lines',${id},array[${data}]::typ_record[],2,'payment_line_id',0,0); COMMIT;`
        );
        let payment_line_id = dataReponse[0][0].p_internal_id;
        let logQuery = await sequelize.query(
          `begin; call proc_generate_record_log(${user_id},${session_id},'pay_bill_payment_lines',${payment_line_id},1,'payment_line_id'); commit;`
        );
      }
      let saveQuantity = await sequelize.query(
        `begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'BILLPAY'); commit;`
      );
    }
    res.status(200).json({ data: "Record Updated Successfully!" });
  } catch (err) {
    res.status(400).send(err.stack);
  }
};

exports.delete = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    let id = req.params.Id;
    let dataReponse = await sequelize.query(
      `begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_bill_payment_lines',${id}, null,3,'payment_line_id',0,0); commit;`
    );
    let logQuery = await sequelize.query(
      `begin; call proc_generate_record_log(${user_id},${session_id},'pay_bill_payment_lines',${id},3,'payment_line_id'); commit;`
    );
    res.status(200).json({ data: "Record Deleted Successfully!" });
  } catch (err) {
    res.status(400).send(err.stack);
  }
};

// exports.getInvoiceLineDetail = async (req, res) => {
//     try {
//         const { user_id, session_id } = req.user;
//         const id = req.params.Id;
//         let query = await sequelize.query(`select * from func_get_order_ship_line_for_invoice(${id},${user_id},${session_id}) `)
//         if (!query[0][0]) return res.status(404).json({ data: "Record not found" })
//         return res.status(200).json(query[0])
//     }
//     catch (err) {
//         res.status(400).send(err.stack)
//     }
// }
