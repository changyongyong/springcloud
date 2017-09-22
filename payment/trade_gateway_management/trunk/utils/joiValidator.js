const Joi = require('joi');

module.exports = (schema, options) => {
    options = options || {};
    //生成校验中间件
    return (req, res, next) => {
        let toValidate = {};
        if (!schema) {
            return next();
        }
        ['params', 'body', 'query'].forEach(function (key) {
            if (schema[key]) {
                toValidate[key] = req[key];
            }
        });
        return Joi.validate(toValidate, schema, options, (err) => {
            if (err) {
                let details = err && err.details || [];
                let failures = [];
                for (let detail of details) {
                    failures.push(detail.message);
                }
                return res.validationFailed(failures);
            }
            return next();
        });
    }
};