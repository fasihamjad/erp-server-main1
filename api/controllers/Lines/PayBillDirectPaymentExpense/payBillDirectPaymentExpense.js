const { sequelize } = require("../../../config/database");
const { getCol, boolFilter } = require("../../../utils/helper");

exports.create = async (req, res) => {
	try {
		let dataReponse;
		const { user_id, session_id } = req.user;
		if (req.body.data.length > 0) {
			const newData = req.body.data.filter(item=>item.account_id!="");
			// const newData = req.body.data.map(({ item_code, ...rest }) => ({ ...rest }));
			for (let i = 0; i < newData.length; i++) {
				let data = await boolFilter(newData[i]);
				data.push(`row('created_by',${user_id})`);
				data.push(`row('created_date',current_timestamp)`);
				data.push(`row('is_deleted',0)`);
				dataReponse = await sequelize.query(
					`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_bill_direct_payment_expense',0, array[${data}]::typ_record[],1,'direct_payment_expense_id',1,1); commit;`
				);
				let direct_payment_expense_id = dataReponse[0][0].p_internal_id;
				let logQuery = await sequelize.query(
					`begin; call proc_generate_record_log(${user_id},${session_id},'pay_bill_direct_payment_expense',${direct_payment_expense_id},1,'direct_payment_expense_id'); commit;`
				);
			}
		}
		res.status(200).json({ data: "Record Inserted !", direct_payment_expense_id: dataReponse[0][0].p_internal_id });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

//this ia a test 
exports.getOne = async (req, res) => {
	try {
	  const { user_id, session_id } = req.user;
	  const direct_payment_header_id = req.params.Id;
	  let newQuery = await sequelize.query(
		`select * from func_get_pay_bill_direct_payment_expense_grid(${direct_payment_header_id}, ${user_id}, ${session_id})`
	  );
	  console.log (newQuery);
	  if (newQuery[1].rowCount === 0) {
		return res.status(404).json({ data: "No Record Found !" });
	  } else {
		return res.status(200).json({ data: newQuery[0] });
	  }
	} catch (err) {
	  res.status(400).send(err.stack);
	}
};


exports.getAll = async (req, res, from) => {
	try {
		const { user_id, session_id } = req.user;
		let query;
		let { column_name, column_with_type } = await getCol("pay_bill_direct_payment_expense", "direct_payment_expense_id", "N");
		query = await sequelize.query(
			`select ${column_name} from func_get_table_data('pay_bill_direct_payment_expense','${column_name}','direct_payment_expense_id',2,'-1',${user_id},${session_id},1,0,'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `
		);
		res.status(200).send({ data: query[0] });
	} catch (err) {
		res.status(400).json(err.stack);
	}
};

// exports.update = async (req, res) => {
//     try {
//         const { user_id, session_id } = req.user;
//         let id = req.params.Id;
//         const { is_active } = req.body;
//         let { column_name, column_with_type } = await getCol("pay_bill_direct_payment_expense", "direct_payment_expense_id", "N");
//         let data = await boolFilter(req.body);
//         data.push(`row('last_updated_by',${user_id})`);
//         data.push(`row('last_updated_date',current_timestamp)`);
//         let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('pay_bill_direct_payment_expense','${column_name}','direct_payment_expense_id',2,'${id}',${user_id}, ${session_id},1,0, 'NO_COMPANY_ACCESS_REQUIRED') as erptab (${column_with_type}) `)
//         if (isExsist[1].rowCount === 0) {
//             res.status(404).json({ data: "No Record Found!" })
//         }
//         else {
//             dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(${user_id},${session_id},'pay_bill_direct_payment_expense',${id},array[${data}]::typ_record[],2,'direct_payment_expense_id',0,0); COMMIT;`);
//             let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_bill_direct_payment_expense',${id},2,'direct_payment_expense_id'); commit;`)
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
      if (req.body.data.length > 0) {
		const newData = req.body.data.filter(item=>item.account_id!="");
        // const newData = req.body.data.map(({ item_code, ...rest }) => ({ ...rest,  }));
        for (let i = 0; i < newData.length; i++) {
          if (newData[i].direct_payment_expense_id) {
            let data = await boolFilter(newData[i]);
            data.push(`row('last_updated_by',${user_id})`);
			data.push(`row('last_updated_date',current_timestamp)`);
            //  let direct_payment_expense_id = dataReponse[0][0].p_internal_id;
			let direct_payment_expense_id=newData[i].direct_payment_expense_id
			let dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'pay_bill_direct_payment_expense',${direct_payment_expense_id},array[${data}]::typ_record[],2,'direct_payment_expense_id',0,0); COMMIT;`);
             let logQuery = await sequelize.query( `begin; call proc_generate_record_log(${user_id},${session_id},'pay_bill_direct_payment_expense',${direct_payment_expense_id},1,'direct_payment_expense_id'); commit;`);
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
		await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'pay_bill_direct_payment_expense',${id}, null,3,'direct_payment_expense_id',0,0); commit;`);
		await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'pay_bill_direct_payment_expense',${id},3,'direct_payment_expense_id'); commit;`);
		res.status(200).json({ data: "Record Deleted Successfully!" });
	} catch (err) {
		res.status(400).send(err.stack);
	}
};
