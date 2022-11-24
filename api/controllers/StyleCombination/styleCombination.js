const { sequelize } = require("../../config/database")
const { getCol, dataFilter } = require("../../utils/helper");

const getRise = require('../Rise/Rise')
const getRiseLabel = require('../Rise_Label/rise_label')
const getCut = require("../Cut/Cut");
const getGender = require("../Gender/gender")
const getGenderCategory = require("../Gender_Category/gender_category")
const getFitCategory = require("../Fit_Category/fit_category");


exports.create = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { is_default, style_id } = req.body;
        let data = await dataFilter(req.body);
        data.push(`row('is_active',true)`);
        is_default ? data.push(`row('is_default',true)`) : data.push(`row('is_default',false)`)
        if (is_default) {
            let defaultFalse = await sequelize.query(`UPDATE inv_style_combination set is_default=false where style_id=${style_id}`)
        }
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(${user_id},${session_id},'inv_style_combination',0, array[${data}]::typ_record[],1,'style_combination_id',1,1); commit;`);
        let style_combination_id = dataReponse[0][0].p_internal_id;
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_style_combination',${style_combination_id},1,'style_combination_id'); commit;`);
        res.status(200).json({ data: "Record Inserted !", style_combination_id })

    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getAll = async (req, res, from) => {
    try {
        const { user_id, session_id } = req.user;
        let { column_name, column_with_type } = await getCol("inv_style_combination", "style_combination_id", "N");
        let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_style_combination','${column_name}','style_combination_id',2,'-1',${user_id},${session_id},1,0,'GET_SETUP_DATA') as erptab (${column_with_type}) order by 1 desc `)
        res.status(200).send({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}
exports.getOne = async (req, res) => {
    try {
        const id = req.params.Id;
        const { user_id, session_id } = req.user;
        const { filter } = req.query
        let { column_name, column_with_type } = await getCol("inv_style_combination", "style_combination_id", filter)
        let query = await sequelize.query(`select * from func_get_table_data('inv_style_combination','${column_name}','style_id',2,'${id}',${user_id},${session_id},1,0,'MASTER_DETAIL') as erptab (${column_with_type}) `)
        if (query[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found !" })
        }
        else {
            res.status(200).json({ data: query[0] })
        }
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}
exports.update = async (req, res) => {
    try {
        const { user_id, session_id } = req.user;
        const { style_id, is_default } = req.body;
        let id = req.params.Id;
        let { column_name, column_with_type } = await getCol("inv_style_combination", "style_combination_id", "N");
        let data = await dataFilter(req.body);
        is_default ? data.push(`row('is_default',true)`) : data.push(`row('is_default',false)`)
        if (is_default) {
            let defaultFalse = await sequelize.query(`UPDATE inv_style_combination set is_default=false where style_id=${style_id}`)
        }
        let isExsist = await sequelize.query(`select ${column_name} from func_get_table_data('inv_style_combination','${column_name}','style_combination_id',2,'${id}',${user_id},${session_id},1,0, 'MASTER_DETAIL') as erptab (${column_with_type}) `)
        if (isExsist[1].rowCount === 0) {
            res.status(404).json({ data: "No Record Found !" })
        }
        else {
            dataReponse = await sequelize.query(`BEGIN; call proc_erp_crud_operations(1,1,'inv_style_combination',${id},array[${data}]::typ_record[],2,'style_combination_id',0,0); COMMIT;`);
            let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_style_combination',${id},2,'style_combination_id'); commit;`)
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
        let dataReponse = await sequelize.query(`begin; call proc_erp_crud_operations(1,1,'inv_style_combination',${id}, null,3,'style_combination_id',0,0); commit;`)
        let logQuery = await sequelize.query(`begin; call proc_generate_record_log(${user_id},${session_id},'inv_style_combination',${id},3,'style_combination_id'); commit;`)
        res.status(200).json({ data: "Record Deleted Successfully!" })
    }
    catch (err) {
        res.status(400).send(err.stack)
    }
}

exports.getCombinationForm = async (req, res, from) => {
    try {
        const { company_id } = req.body;
        let from = "items"
        if (company_id) {
            let rises = await getRise.getAll(req, res, from);
            let riseLabels = await getRiseLabel.getAll(req, res, from);
            let genders = await getGender.getAll(req, res, from);
            let genderCategories = await getGenderCategory.getAll(req, res, from);
            let cuts = await getCut.getAll(req, res, from);
            let fitCategories = await getFitCategory.getAll(req, res, from);

            let riseDetail = rises.map(rise => {
                return {
                    rise_id: rise.rise_id,
                    rise_name: rise.rise_name,
                    is_active: rise.is_active
                }
            });
            let riseLabelDetail = riseLabels.map(riseLabel => {
                return {
                    rise_label_id: riseLabel.rise_label_id,
                    rise_label_name: riseLabel.rise_label_name,
                    is_active: riseLabel.is_active
                }
            });
            let genderDetail = genders.map(gender => {
                return {
                    gender_id: gender.gender_id,
                    gender_name: gender.gender_name,
                    is_active: gender.is_active
                }
            });
            let genderCategoryDetail = genders.map(gender => {
                return {
                    id: gender.gender_id,
                    data: genderCategories.filter(single => {
                        if (gender.gender_id === single.gender_id) {
                            return single
                        }
                    })
                }
            })
            let cutsDetail = cuts.map(cut => {
                return {
                    cut_id: cut.cut_id,
                    cut_name: cut.cut_name,
                    is_active: cut.is_active
                }
            });
            let fitCategoryDetail = fitCategories.map(fitCategory => {
                return {
                    fit_category_id: fitCategory.fit_category_id,
                    fit_category_name: fitCategory.fit_category_name,
                    is_active: fitCategory.is_active
                }
            });

            res.status(200).send({ rise: riseDetail, riseLabel: riseLabelDetail, gender: genderDetail, genderCategory: genderCategoryDetail, cut: cutsDetail, fitCategory: fitCategoryDetail })
            // , gender: genderDetail, genderCategory: genderCategoryDetail, cut: cutsDetail
        }

        // const { user_id, session_id } = req.user;
        // let { column_name, column_with_type } = await getCol("inv_style_combination", "style_combination_id", "N");
        // let query = await sequelize.query(`select ${column_name} from func_get_table_data('inv_style_combination','${column_name}','style_combination_id',2,'-1',${user_id},${session_id},1,0,'GET_SETUP_DATA') as erptab (${column_with_type}) `)
        // res.status(200).send({ data: query[0] })
    }
    catch (err) {
        res.status(400).json(err.stack)
    }
}

