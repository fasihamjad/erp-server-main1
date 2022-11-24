const { sequelize } = require("../../config/database");
const { getCol, dataFilter } = require("../../utils/helper");
exports.create = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    const { parameter_description, id } = req.body;
    let data = await dataFilter(req.body);
    data.push(`row('is_deleted',0)`);
    let dataReponse = await sequelize.query(
      `begin; call proc_erp_crud_operations(1,1,'sys_report_parameter',0, array[${data}]::typ_record[],1,'parameter_id',1,1); commit;`
    );
    let parameter_id = dataReponse[0][0].p_internal_id;
    let logQuery = await sequelize.query(
      `begin; call proc_generate_record_log(${user_id},${session_id},'sys_report_parameter',${parameter_id},1,'parameter_id'); commit;`
    );
    return res.status(200).json({ data: "Record Inserted !", parameter_id });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};
exports.getAll = async (req, res) => {
  try {
    let query = await sequelize.query(`select * from sys_report_parameter where is_deleted = 0`);
    res.status(200).send({ data: query[0] });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

exports.getOne = async (req, res) => {
  try {
    const { session_id, user_id } = req.user;
    const id = req.params.Id;
    let { column_name, column_with_type } = await getCol(
      "sys_report_parameter",
      "parameter_id",
      "N"
    );
    let query = await sequelize.query(
      `select * from sys_report_parameter where parameter_id = '${id}' AND is_deleted = 0`
    );
    if (query[1].rowCount === 0) {
      res.status(404).json({ data: "No Record Found !" });
    } else {
      res.status(200).json({ data: query[0] });
    }
  } catch (err) {
    res.status(400).json(err.stack);
  }
};
exports.update = async (req, res) => {
  try {
    let id = req.params.Id
    const { user_id, session_id } = req.user
    let { parameter_description } = req.body
    let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'sys_report_parameter',${id},array[row('parameter_description','${parameter_description}')]::typ_record[],2,'parameter_id',0,0); COMMIT;`)
    let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'sys_report_parameter',${id},2,'parameter_id'); commit;`)
    res.status(200).json({ data: "Record Updated Successfully!" })
  }
  catch (err) {
    res.status(400).json(err.stack)
  }
}

exports.delete = async (req, res) => {
  try {
    let id = req.params.Id
    const { user_id, session_id } = req.user
    let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'sys_report_parameter',${id},3,'parameter_id'); commit;`)
    let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'sys_report_parameter',${id}, null,3,'parameter_id',0,0); commit;`)
    res.status(200).json({ data: "Record Deleted Successfully!" })
  }
  catch (err) {
    res.status(400).json(err.stack)
  }
}