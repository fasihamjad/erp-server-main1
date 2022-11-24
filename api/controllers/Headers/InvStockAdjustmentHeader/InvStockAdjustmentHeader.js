const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");
const getAdminLocation = require("../../Admin/AdminLocation/adminLocation");
const getAdminShipVia = require("../../Admin/AdminShipVia/adminShipVia");

exports.create = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      const { company_id } = req.body;
      let data = await boolFilter(req.body);
      data.push(`row('created_by',${user_id})`);
      data.push(`row('created_date',current_timestamp)`);
      data.push(`row('is_deleted',0)`);

      let adjustmentHeaderNo = await sequelize.query(
        `SELECT COALESCE(MAX(CAST (adjustment_header_no as integer)),0)+1 as adjustment_header_no from inv_stock_adjustment_header where company_id=${company_id}`
      );
      data.push(`row('adjustment_header_no',${adjustmentHeaderNo[0][0].adjustment_header_no})`);

      let response = await sequelize.query(
        `begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_stock_adjustment_header',0, array[${data}]::typ_record[],1,'adjustment_header_id',1,1); commit;`
      );

      let adjustment_header_id = response[0][0].p_internal_id;
      let query = await sequelize.query(
        `begin; call proc_generate_record_log(${user_id},${session_id},'inv_stock_adjustment_header',${adjustment_header_id},1,'adjustment_header_id'); commit;`
      );
      
      res.status(200).json({ data: "Record Inserted !", adjustment_header_id, adjustment_header_no:adjustmentHeaderNo[0][0].adjustment_header_no });
    } catch (err) {
      res.status(400).json(err.stack);
    }
};

exports.getAll = async (req, res, from) => {
  try {
    const { user_id, session_id } = req.user;
    const { startDate, endDate } = req.body;
    if (new Date(startDate) > new Date(endDate))
      return res
        .status(400)
        .json({ data: "Start date cannot be greater than End date" });
    let query = await sequelize.query(
      `select * from func_get_stock_adjustment_grid(null,'${startDate}','${endDate}',${user_id},${session_id}) order by adjustment_header_id desc `
    );
    res.status(200).send({ data: query[0] });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

exports.getOne = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    // console.log("id===>", req.params.Id);

    const id = req.params.Id;
    let query = await sequelize.query(
      `select * from func_get_stock_adjustment_grid(${id},null,null,${user_id},${session_id})`
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
      "inv_stock_adjustment_header",
      "adjustment_header_id",
      "N"
    );
    let data = await boolFilter(req.body);
    data.push(`row('last_updated_by',${user_id})`);
    data.push(`row('last_updated_date',current_timestamp)`);
    let isExsist = await sequelize.query(
      `select ${column_name} from func_get_table_data('inv_stock_adjustment_header','${column_name}','adjustment_header_id',2,'${id}',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type})`
    );
    if (isExsist[1].rowCount === 0) {
      res.status(404).json({ data: "No Record Found!" });
    } else {
      dataReponse = await sequelize.query(
        `BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'inv_stock_adjustment_header',${id},array[${data}]::typ_record[],2,'adjustment_header_id',0,0); COMMIT;`
      );
      let logQuery = await sequelize.query(
        `begin; call proc_generate_record_log(${user_id},${session_id},'inv_stock_adjustment_header',${id},2,'adjustment_header_id'); commit;`
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
      `begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_stock_adjustment_header',${id}, null,3,'adjustment_header_id',0,0); commit;`
    );
    let logQuery = await sequelize.query(
      `begin; call proc_generate_record_log(${user_id},${session_id},'inv_stock_adjustment_header',${id},3,'adjustment_header_id'); commit;`
    );
    res.status(200).json({ data: "Record Deleted Successfully!" });
  } catch (err) {
    res.status(400).send(err.stack);
  }
};

exports.getCreditHeaderDetail = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    const id = req.params.Id;
    let query = await sequelize.query(
      `select * from func_get_credit_note_grid(${id},null,null,${user_id},${session_id}) `
    );
    if (!query[0][0]) return res.status(404).json({ data: "Record not found" });
    return res.status(200).json(query[0]);
  } catch (err) {
    res.status(400).send(err.stack);
  }
};

exports.InvStockAdjustmentFormData = async (req, res) => {
  try {
    let location = await getAdminLocation.getAll(req, res, "");
    let shipVia = await getAdminShipVia.getAll(req, res, "saleOrder");

    return res.status(200).json({
      location: location,
      shipVia: shipVia,
    });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};
