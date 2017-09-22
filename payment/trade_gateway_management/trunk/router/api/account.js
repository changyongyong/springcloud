/**
 * Created by wt on 2017/7/26.
 */
const router = require('express').Router();
const joiValidator = require('../../utils/joiValidator');
const Joi = require('joi');
const operate = require('../../service/common/operate');
const accountServer = require('../../service/account/account');

router.post('/add', joiValidator({
    body: {
        accountName: Joi.string().required(),
        accountType: Joi.string().required(),
        accountChannel: Joi.string().required(),
        accountSecretKey: Joi.string().required(),
        accountAppId: Joi.string().required(),
        accountEmail: Joi.string().required()
    }
}), operate.operateWrite('account_add'),
    (req, res, next)=> {
        accountServer.addAccount(req.body)
            .then(()=> {
                req.operate = true; //操作成功
                res.json({
                    tag: 'success',
                    status: 1
                });
                next()
            })
            .catch((error)=> {
                req.error = error;
                res.json({
                    tag: 'error',
                    message: error.message || '添加失败',
                    status: -1
                });
                next()
            })
    },
    operate.operateEnd());

module.exports = router;
