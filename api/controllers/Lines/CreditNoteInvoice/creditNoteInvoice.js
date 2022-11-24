const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    if (req.body.data.length > 0) {
      for (let i = 0; i < req.body.data.length; i++) {
        const newData = req.body.data.map(({ item_code, ...rest }) => ({
          ...rest,
        }));

        let data = await boolFilter(newData[i]);
        data.push(`row('created_by',${user_id})`);
        data.push(`row('created_date',current_timestamp)`);
        data.push(`row('is_deleted',0)`);
        let dataReponse = await sequelize.query(
          `begin; call proc_erp_crud_operations(${user_id},${session_id},'ar_credit_note_invoice',0, array[${data}]::typ_record[],1,'note_invoice_id',1,1); commit;`
        );
        let note_invoice_id = dataReponse[0][0].p_internal_id;
        let logQuery = await sequelize.query(
          `begin; call proc_generate_record_log(${user_id},${session_id},'ar_credit_note_invoice',${note_invoice_id},1,'note_invoice_id  '); commit;`
        );
      }
    }
    res.status(200).json({ data: "Record Inserted !" });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

exports.getAll = async (req, res, from) => {
  try {
    const { user_id, session_id } = req.user;
    let query;
    let { column_name, column_with_type } = await getCol(
      "ar_credit_note_invoice",
      "note_invoice_id",
      "N"
    );

    query = await sequelize.query(
      `select ${column_name} from func_get_table_data('ar_credit_note_invoice','${column_name}','note_invoice_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `
    );
    res.status(200).send({ data: query[0] });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

exports.getOne = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    const id = req.params.Id;
    let newQuery = await sequelize.query(
      `select * from func_get_credit_note_invoice_grid(${id}, ${user_id}, ${session_id})`
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
    let id = req.params.Id;
    if (req.body.data.length > 0) {
      const newData = req.body.data.map(({ item_code, ...rest }) => ({
        ...rest,
      }));
      for (let i = 0; i < req.body.data.length; i++) {
        if (!newData[i].note_invoice_id) {
          let data = await boolFilter(newData[i]);
          data.push(`row('last_updated_by',${user_id})`);
          data.push(`row('last_updated_date',current_timestamp)`);
          let dataReponse = await sequelize.query(
            `BEGIN; call proc_erp_crud_operations(1,1,'ar_credit_note_invoice',${id},array[${data}]::typ_record[],2,'note_invoice_id',0,0); COMMIT;`
          );
          let note_invoice_id = dataReponse[0][0].p_internal_id;
          let logQuery = await sequelize.query(
            `begin; call proc_generate_record_log(${user_id},${session_id},'ar_credit_note_invoice',${note_invoice_id},1,'note_invoice_id'); commit;`
          );
        }
      }
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
      `begin; call proc_erp_crud_operations(${user_id},${session_id},'ar_credit_note_invoice',${id}, null,3,'note_invoice_id',0,0); commit;`
    );
    let logQuery = await sequelize.query(
      `begin; call proc_generate_record_log(${user_id},${session_id},'ar_credit_note_invoice',${id},3,'note_invoice_id'); commit;`
    );
    res.status(200).json({ data: "Record Deleted Successfully!" });
  } catch (err) {
    res.status(400).send(err.stack);
  }
};
