const { sequelize } = require("../../../config/database")
const { getCol, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        if (req.body.data.length > 0) {
            
            for (let i = 0; i < req.body.data.length; i++) {
                const newData = req.body.data.map(({ item_code, ...rest }) => ({ ...rest }))
                let headerId = req.body.data[0].payment_header_id
                let data = await boolFilter(newData[i]);
                data.push(`row('created_by',${user_id})`);
                data.push(`row('created_date',current_timestamp)`);
                data.push(`row('is_deleted',0)`);
                console.log("data",data)
                let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_customer_payment_note',0, array[${data}]::typ_record[],1,'payment_note_id',1,1); commit;`)
                let payment_note_id = dataReponse[0][0].p_internal_id;
                // let saveQuantity = await sequelize.query(`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${headerId},'PAYINVOICE'); commit;`)
                let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_customer_payment_note',${payment_note_id},1,'payment_note_id'); commit;`);
            }
        }
        res.status(200).json({ data: "Record Inserted !" })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getAll = async (req, res, from) => {
    try {
      const { user_id, session_id } = req.user;
      let query;
    // console.log("this is body",req.body);
      query = await sequelize.query(
         `select * from func_get_customer_payment_note_grid(${req.body.payment_header_id},${user_id}, ${session_id})`);
    
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
};
exports.getOne = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
  
      const id = req.params.Id;   //payment_header_id 
      let newQuery = await sequelize.query(`select * from func_get_customer_payment_note_grid(${id}, ${user_id}, ${session_id})`);
      if (newQuery[1].rowCount === 0) {
        return res.status(404).json({ data: "No Record Found !" });
      } else {
        return res.status(200).json({ data: newQuery[0] });
      }
    } catch (err) {
      res.status(400).send(err.stack);
    }
};

// exports.update = async (req, res) => {
//     try {
//         const { user_id, session_id } = req.user;
//         let id = req.params.Id;
//         const { is_active } = req.body;
//         let { column_name, column_with_type } = await getCol("pay_customer_payment_note", "payment_note_id", "N");
//         let data = await boolFilter(req.body);
//         data.push(`row('last_updated_by',${user_id})`);
//         data.push(`row('last_updated_date',current_timestamp)`);
//         let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('pay_customer_payment_note','${column_name}','payment_note_id',2,'${id}',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
//         if (isExsist[1].rowCount === 0) {
//             res.status(404).json({ data: "No Record Found!" })
//         }
//         else {
//             dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'pay_customer_payment_note',${id},array[${data}]::typ_record[],2,'payment_note_id',0,0); COMMIT;`);
//             let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_customer_payment_note',${id},2,'payment_note_id'); commit;`)
//             res.status(200).json({ data: "Record Updated Successfully!" })
//         }
//     }
//     catch (err) {
//         res.status(400).send(err.stack)
//     }
// };

exports.update = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    let id = req.params.Id;
    if (req.body.length > 0) {
      const newData = req.body.map(({ item_code, ...rest }) => ({ ...rest,  }));
    
      for (let i = 0; i < newData.length; i++) {
        if (newData[i].payment_note_id) {
          let data = await boolFilter(newData[i]);
          data.push(`row('last_updated_by',${user_id})`);
    data.push(`row('last_updated_date',current_timestamp)`);

    let payment_note_id=newData[i].payment_note_id

    let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'pay_customer_payment_note',${payment_note_id},array[${data}]::typ_record[],2,'payment_note_id',0,0); COMMIT;`);
           let logQuery = await sequelize.query( `begin; call proc_generate_record_log(${user_id},${session_id},'pay_customer_payment_note',${payment_note_id},1,'payment_note_id'); commit;`);
        }
      }
    }
    res.status(200).json({ data: "Record Updated Successfully!" });
  } catch (err) {
    console.log(err.stack)
    res.status(400).send(err.stack);
  }
};

exports.delete = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        let id = req.params.Id;
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_customer_payment_note',${id}, null,3,'payment_note_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_customer_payment_note',${id},3,'payment_note_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
};

exports.funcGetCreditNoteForInvoiceKnockof = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { customer_id} = req.body;
      
        let query = await sequelize.query(
        `select * from func_get_credit_note_for_invoice_knockof(${customer_id},${user_id},${session_id})`
      );
      res.status(200).send({ data: query[0] });
    } catch (err) {
      res.status(400).json(err.stack);
    }
  };