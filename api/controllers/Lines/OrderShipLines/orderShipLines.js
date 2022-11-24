const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
    try {
      const { user_id, session_id } = req.user;
      
      let id; 
      if (req.body.data.length > 0) {
        for (let i = 0; i < req.body.data.length; i++) {
          const newData = req.body.data.map(({ item_code, ...rest }) => ({ ...rest }));
          id  = newData[0].ship_header_id;

          let data = await boolFilter(newData[i]);
          data.push(`row('created_by',${user_id})`);
          data.push(`row('created_date',current_timestamp)`);
          data.push(`row('is_deleted',0)`);
          let dataReponse = await sequelize.query(
            `begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_order_ship_lines',0, array[${data}]::typ_record[],1,'ship_line_id',1,1); commit;`
          );
          let ship_line_id = dataReponse[0][0].p_internal_id;
          let logQuery = await sequelize.query(
            `begin; call proc_generate_record_log(${user_id},${session_id},'scm_order_ship_lines',${ship_line_id},1,'ship_line_id  '); commit;`
          );
        }
        
        let saveQuantity = await sequelize.query(
          `begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'SHIPMENT'); commit;`
        );
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
		let { column_name, column_with_type } = await getCol("scm_order_ship_lines", "ship_line_id", "N");
		query = await sequelize.query(
			`select ${column_name} from func_get_table_data('scm_order_ship_lines','${column_name}','ship_line_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `
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
		let newQuery = await sequelize.query(`select * from func_get_sale_shipment_lines_grid(${id}, ${user_id}, ${session_id})`);
		// let { column_name, column_with_type } = await getCol("scm_order_ship_lines", "ship_line_id", "N")
		// let query = await sequelize.query(`select ${column_name} from func_get_table_data('scm_order_ship_lines','${column_name}','ship_line_id',2,'${id}',${user_id},${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED' ) as erptab (${column_with_type}) `)
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
      if (req.body.dataLine.length > 0) {
        const newData = req.body.dataLine.map(({ item_code, ...rest }) => ({ ...rest,  }));
        for (let i = 0; i < req.body.dataLine.length; i++) {
          if (newData[i].ship_line_id) {
            let data = await boolFilter(newData[i]);
            data.push(`row('last_updated_by',${user_id})`);
			data.push(`row('last_updated_date',current_timestamp)`);
            //  let ship_line_id = dataReponse[0][0].p_internal_id;
			let ship_line_id=newData[i].ship_line_id
			let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'scm_order_ship_lines',${ship_line_id},array[${data}]::typ_record[],2,'ship_line_id',0,0); COMMIT;`);
             let logQuery = await sequelize.query( `begin; call proc_generate_record_log(${user_id},${session_id},'scm_order_ship_lines',${ship_line_id},1,'ship_line_id'); commit;`);
          }
        }
		let saveQuantity = await sequelize.query(
			`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'SHIPMENT'); commit;`
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
		let dataResponse = await sequelize.query(
			`begin; call proc_erp_crud_operations(${user_id},${session_id},'scm_order_ship_lines',${id}, null,3,'ship_line_id',0,0); commit;`
		);
		let logQuery = await sequelize.query(
			`begin; call proc_generate_record_log(${user_id},${session_id},'scm_order_ship_lines',${id},3,'ship_line_id'); commit;`
		);
		let saveQuantity = await sequelize.query(
			`begin; call proc_updated_order_ship_quantity(${user_id}, ${session_id}, ${id},'SHIPMENT'); commit;`
		  );
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};

exports.getOrderShipmentLine = async (req, res) => {
	try {
		const { user_id, session_id } = req.user;
		const id = req.params.Id;
		let query = await sequelize.query(`select * from func_get_sale_order_line_for_shipment(${id},${user_id},${session_id}) `);
		if (!query[0][0]) return res.status(404).json({ data: "Record not found" });
		return res.status(200).json(query[0]);
	} catch (err) {
		res.status(400).send(err.stack);
	}
};