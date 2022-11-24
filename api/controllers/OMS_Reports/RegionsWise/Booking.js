const { sequelize } = require("../../../config/database");

exports.getSaleOrderGroupReport = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    const { from_date, to_date } = req.body;
    const {gender_id,date_type,region_id,term_id,company_id} = req.body;

    // let SKU = sku === null ? null : `'${sku}'`;
    if (new Date(from_date) > new Date(to_date))
      return res.status(400).json({ data: "Start date cannot be greater than End date" });
      let query = await sequelize.query(
      `select * from func_get_sale_order_oms_report('${from_date}','${to_date}',${gender_id},'${date_type}',${user_id},${session_id},${region_id},${term_id},${company_id})`
    );
    res.status(200).send({ data: query[0] });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

exports.getSaleOrderOmsStateReport = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    const { from_date, to_date } = req.body;
    const {gender_id,date_type,region_id,term_id,company_id} = req.body;

    // let SKU = sku === null ? null : `'${sku}'`;
    
    if (new Date(from_date) > new Date(to_date))
      return res.status(400).json({ data: "Start date cannot be greater than End date" });
    let query = await sequelize.query(
      `select * from func_get_sale_order_oms_state_report('${from_date}','${to_date}',${gender_id},'${date_type}',${user_id},${session_id},${region_id},${term_id},${company_id})`
    );
    res.status(200).send({ data: query[0] });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

exports.getSaleOrderOmsCustomerByRegionStateReport = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    const { from_date, to_date } = req.body;
    const {gender_id,date_type,region_id,term_id,company_id,state_id} = req.body;

    // let SKU = sku === null ? null : `'${sku}'`;
    
    if (new Date(from_date) > new Date(to_date))
      return res.status(400).json({ data: "Start date cannot be greater than End date" });
    let query = await sequelize.query(
      `select * from func_get_sale_order_oms_customer_by_region_state_report('${from_date}','${to_date}',${gender_id},'${date_type}',${user_id},${session_id},${region_id},${term_id},${company_id},${state_id})`
    );
    res.status(200).send({ data: query[0] });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

exports.getSaleOrderOmsByCustomerReport = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    const { from_date, to_date } = req.body;
    const {gender_id,date_type,region_id,term_id,company_id,state_id,customer_id} = req.body;

    // let SKU = sku === null ? null : `'${sku}'`;
    
    if (new Date(from_date) > new Date(to_date))
      return res.status(400).json({ data: "Start date cannot be greater than End date" });
    let query = await sequelize.query(
      `select * from func_get_sale_order_oms_by_customer_report('${from_date}','${to_date}',${gender_id},'${date_type}',${user_id},${session_id},${region_id},${term_id},${company_id},${state_id},${customer_id})`);
    res.status(200).send({ data: query[0] });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

exports.funcGetSaleOrderPrint = async (req, res) => {
  try {
    const { user_id, session_id } = req.user;
    const { order_header_id } = req.body;
    
    let query = await sequelize.query(
      `select * from func_get_sale_order_print(${order_header_id},${user_id},${session_id})`);
    res.status(200).send({ data: query[0] });
  } catch (err) {
    res.status(400).json(err.stack);
  }
};

