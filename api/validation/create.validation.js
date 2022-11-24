const Joi = require('joi');

module.exports.validation = (req, res, next) => {
    let myController = req.params.Controller;
    switch (myController) {
        case "fit_category": fit_category(req, res, next); break;
        case "rise_label": rise_label(req, res, next); break;
        case "fabric": fabric(req, res, next); break;
        case "gender": gender(req, res, next); break;
        // case "gender_category": gender_category(req, res, next); break;
        // case "style": style(req, res, next); break;
        default: anything(req, res, next);
    }



};

const fit_category = (req, res, next) => {
    const { body } = req;
    const schema = Joi.object().keys({
        'fit_category_name': Joi.string().trim().label('fit_category_name').required(),
        'is_active': Joi.bool().label('is_active').required(),
        'created_by': Joi.number().label('created_by').required(),
        'user_id': Joi.number().label('user_id').required(),
        'session_id': Joi.number().label('session_id').required(),
    }).options({ abortEarly: false, allowUnknown: false });
    const result = schema.validate(body);
    joiResponse(result, res, next);
}
const rise_label = (req, res, next) => {
    const { body } = req;
    const schema = Joi.object().keys({
        'rise_label_name': Joi.string().trim().label('rise_label_name').required(),
        'is_active': Joi.bool().label('is_active').required(),
        'created_by': Joi.number().label('created_by').required(),
        'user_id': Joi.number().label('user_id').required(),
        'session_id': Joi.number().label('session_id').required(),
    }).options({ abortEarly: false, allowUnknown: false });
    const result = schema.validate(body);
    joiResponse(result, res, next);
}
const fabric = (req, res, next) => {
    const { body } = req;
    const schema = Joi.object().keys({
        'fabric_name': Joi.string().trim().label('fabric_name').required(),
        'is_active': Joi.bool().label('is_active').required(),
        'created_by': Joi.number().label('created_by').required(),
        'user_id': Joi.number().label('user_id').required(),
        'session_id': Joi.number().label('session_id').required(),
    }).options({ abortEarly: false, allowUnknown: false });
    const result = schema.validate(body);
    joiResponse(result, res, next);
}
const gender = (req, res, next) => {
    const { body } = req;
    const schema = Joi.object().keys({
        'gender_name': Joi.string().trim().label('gender_name').required(),
        'is_active': Joi.bool().label('is_active').required(),
        'created_by': Joi.number().label('created_by').required(),
        'user_id': Joi.number().label('user_id').required(),
        'session_id': Joi.number().label('session_id').required(),
    }).options({ abortEarly: false, allowUnknown: false });
    const result = schema.validate(body);
    joiResponse(result, res, next);
}
const gender_category = (req, res, next) => {
    const { body } = req;
    const schema = Joi.object().keys({
        'gender_category_name': Joi.string().trim().label('gender_category_name').required(),
        'is_active': Joi.bool().label('is_active').required(),
        'created_by': Joi.number().label('created_by').required(),
        'user_id': Joi.number().label('user_id').required(),
        'session_id': Joi.number().label('session_id').required(),
    }).options({ abortEarly: false, allowUnknown: false });
    const result = schema.validate(body);
    joiResponse(result, res, next);
}
const style = (req, res, next) => {
    const { body } = req;
    const schema = Joi.object().keys({
        'gender_category_name': Joi.string().trim().label('gender_category_name').required(),
        'is_active': Joi.bool().label('is_active').required(),
        'created_by': Joi.number().label('created_by').required(),
        'user_id': Joi.number().label('user_id').required(),
        'session_id': Joi.number().label('session_id').required(),
    }).options({ abortEarly: false, allowUnknown: false });
    const result = schema.validate(body);
    joiResponse(result, res, next);
}

const anything = (req, res, next) => {
    joiResponse(0, res, next);
}

const joiResponse = (result, res, next) => {
    if (!result.error) {
        next();
    } else {
        const errorArr = [];
        for (i in result.error.details) {
            let makeKey = `${result.error.details[i].path}`;
            var obj = {};
            obj[makeKey] = result.error.details[i].message
            errorArr.push(obj);
        }
        return res.status(500).json(errorArr);
    }
}