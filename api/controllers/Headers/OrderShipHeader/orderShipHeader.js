const { sequelize } = require("../../../config/database")
const { getCol, boolFilter } = require("../../../utils/helper");

const getShipVia = require("../../Admin/AdminCourierService/adminCourierService");
const getAdminShippingMethod = require("../../Admin/AdminShippingMethod/adminShippingMethod");
const getAdminShipTaxCode = require("../../Admin/AdminShipTaxCode/adminShipTaxCode");
const getFreightTerm = require("../../Admin/AdminFreightTerm/adminFreightTerm");
const getAdminBerganPaymentTerm = require("../../Admin/AdminBerganPaymentTerm/adminBerganPaymentTerm")
const getBerganBilling = require("../../Admin/AdminBerganBilling/adminBerganBilling");
const getPTStatus = require("../../PTStatus/ptStatus");
const getShipStatus = require("../../ShipStatus/shipStatus");
const getCustomerTerm = require("../../Customer/CustomerTerm/customerTerm");



exports.create = async (req, res) => {
    try {

        const { user_id, session_id } = req.user;
        const { is_active, status_name, company_id } = req.body;
        let data = await boolFilter(req.body);
        data.push(`row('created_by',${user_id})`);
        data.push(`row('created_date',current_timestamp)`);
        data.push(`row('is_deleted',0)`);
        let shipHeaderNo = await sequelize.query(`SELECT COALESCE(MAX(CAST (ship_header_no as integer)),0)+1 as ship_header_no from scm_order_ship_header where company_id=${company_id}`);
        data.push(`row('ship_header_no',${shipHeaderNo[0][0].ship_header_no})`);

        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_order_ship_header',0, array[${data}]::typ_record[],1,'ship_header_id',1,1); commit;`)
        let ship_header_id = dataReponse[0][0].p_internal_id;
        // console.log("first")
        // await sequelize.query(`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${ship_header_id})`)
        // console.log("2")
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_order_ship_header',${ship_header_id},1,'ship_header_id'); commit;`);

        // let saveQuantity = await sequelize.query(
        //     `begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${ship_header_id},'SHIPMENT'); commit;`
        //   );
        res.status(200).json({ data: "Record Inserted !", ship_header_id, ship_header_no: shipHeaderNo[0][0].ship_header_no })
    }
    catch (err) {

        res.status(400).json(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {

        const { user_id, session_id } = req.user;
        const { startDate, endDate } = req.body;
        if ((new Date(startDate)) > new Date(endDate)) return res.status(400).json({ data: "Start date cannot be greater than End date" })
        let query = await sequelize.query(`select * from func_get_sale_shipment_grid(null,'${startDate}','${endDate}',${user_id},${session_id}) order by ship_header_id desc`)
        res.status(200).send({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

exports.getOne = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;

        const id = req.params.Id;
        // let { column_name, column_with_type } = await getCol("scm_order_ship_header", "ship_header_id", "N")
        // // let query = await sequelize.query(`select ${column_name} from func_get_table_data('scm_order_ship_header','${column_name}','ship_header_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED' ) as erptab (${column_with_type}) `)
        let query = await sequelize.query(`select * from func_get_sale_shipment_grid(${id},null,null,${user_id},${session_id})`)
        if (query[1].rowCount === 0) {
            return res.status(404).json({ data: "No Record Found !" })
        }
        else {
            return res.status(200).json({ data: query[0] })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.update = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        let id = req.params.Id;
        const { is_active } = req.body;
        let { column_name, column_with_type } = await getCol("scm_order_ship_header", "ship_header_id", "N");
        let data = await boolFilter(req.body);
        data.push(`row('last_updated_by',${user_id})`);
        data.push(`row('last_updated_date',current_timestamp)`);
        let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('scm_order_ship_header','${column_name}','ship_header_id',2,'${id}',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found!" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'scm_order_ship_header',${id},array[${data}]::typ_record[],2,'ship_header_id',0,0); COMMIT;`);
            // await sequelize.query(`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id}, 'SHIPMENT')`)
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_order_ship_header',${id},2,'ship_header_id'); commit;`)
            // let saveQuantity = await sequelize.query(
            //     `begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'SHIPMENT'); commit;`
            //   );
            res.status(200).json({ data: "Record Updated Successfully!" })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.delete = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        let id = req.params.Id;
        let { column_name, column_with_type } = await getCol("scm_order_ship_lines", "ship_line_id", "N")
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('scm_order_ship_lines','${column_name}','ship_header_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
        if (query[1].rowCount === 0) {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_order_ship_header',${id}, null,3,'ship_header_id',0,0); commit;`)
            let saveQuantity = await sequelize.query(`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'SHIPMENT'); commit;`)
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_order_ship_header',${id},3,'ship_header_id'); commit;`)
    /*-->*/ //await sequelize.query(`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id}, 'SHIPMENT')`)
            return res.status(200).json({ data: "Record Deleted Successfully!" })
        }
        else {
            let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_order_ship_header',${id}, null,3,'ship_header_id',0,0); commit;`)
            let logQuery2 = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_order_ship_header',${id},3,'ship_header_id'); commit;`)

            for await (const single of query[0]) {
                let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_order_ship_lines',${single.ship_line_id}, null,3,'ship_line_id',0,0); commit;`)
        /*-->*/ await sequelize.query(`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id}, 'SHIPMENT')`)
                let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'scm_order_ship_lines',${id},3,'ship_line_id'); commit;`)
            }
            return res.status(200).json({ data: "Record Deleted Successfully!" })
        }


    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

exports.getOrderShipment = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const id = req.params.Id;
        let query = await sequelize.query(`select * from func_get_sale_order_for_shipment(${id},${user_id},${session_id}) `)
        if (!query[0][0]) return res.status(404).json({ data: "Record not found" })
        return res.status(200).json(query[0][0])
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

exports.formList = async (req, res, from) => {
    try {
        let from = "saleOrder";
        let shipVia = await getShipVia.getAll(req, res, from);
        let freightTerm = await getFreightTerm.getAll(req, res, from);
        let adminShipMethod = await getAdminShippingMethod.getAll(req, res, from);
        let adminShipTaxCode = await getAdminShipTaxCode.getAll(req, res, from);
        let berganPaymentTerm = await getAdminBerganPaymentTerm.getAll(req, res, from);
        let berganBilling = await getBerganBilling.getAll(req, res, from);
        let ptStatus = await getPTStatus.getAll(req, res, from);
        let shipStatus = await getShipStatus.getAll(req, res, from);
        let paymentTerm = await getCustomerTerm.getAll(req, res, from);


        Promise.all([shipStatus, shipVia, freightTerm, adminShipMethod, adminShipTaxCode, berganPaymentTerm, berganBilling, ptStatus, paymentTerm]).then(() => {
            return res.status(200).json({ paymentTerm, shipStatus, ptStatus, shipVia, freightTerm, adminShipMethod, adminShipTaxCode, berganPaymentTerm, berganBilling, })
        }).catch(err => {
            console.log("155", err)
        });
    }
    catch (err) {
        console.log("err 157:", err)
        res.status(400).json(err.stack)
    }
}

