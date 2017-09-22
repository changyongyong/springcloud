/**
 * Created by SEELE on 2017/7/5.
 */


const router = require('express').Router();
const operate = require('../../service/common/operate');
const joiValidator = require('../../utils/joiValidator');
const Joi = require('joi');
const bindServer = require('../../service/bind/bind');
const baseServer = require('../../utils/base');


//  绑定商户和服务商的关系
router.post('/',joiValidator({
    body: Joi.object({
        data: Joi.array().items(Joi.object({
            accountType: Joi.string().valid(['self', 'server']).required(),
            accountChannel: Joi.string().required(),
            merchantNo: Joi.string().allow(null),
            merchantName: Joi.string().allow(null),
            serverConfig: Joi.string().allow(null),
            serverSelfConfig: Joi.string().allow(null)
        })),
        name: Joi.string().required(),
        outSystem: Joi.string().allow(null),
        outType: Joi.string().allow(null),
        outId: Joi.string().allow(null),
    })
}),
    operate.operateWrite('bind_account_merchant'),
    (req, res, next)=> {
        bindServer.bind(req.body)
            .then((data)=> {
                req.operate = true; //操作成功
                res.json({
                    tag: 'success',
                    status: 1,
                    data: data
                });
                next()
            })
            .catch((error)=> {
                req.error = error;
                res.json({
                    tag: 'error',
                    message: error.message || '绑定失败',
                    status: -1
                });
                next()
            })
    },
    operate.operateEnd()
);

router.post('/update', joiValidator({
    body: Joi.object({
        data: Joi.array().items(Joi.object({
            accountType: Joi.string().valid(['self', 'server']).required(),
            accountChannel: Joi.string().required(),
            merchantNo: Joi.string().allow(null),
            merchantName: Joi.string().allow(null),
            serverConfig: Joi.string().allow(null),
            serverSelfConfig: Joi.string().allow(null)
        })),
        name: Joi.string().required(),
        outSystem: Joi.string().allow(null),
        outType: Joi.string().allow(null),
        outId: Joi.string().allow(null),
        id: Joi.number().required()
    })
}),
    operate.operateWrite('update_bind_account_merchant'),
    (req, res, next) => {
        bindServer.update(req.body)
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
                    message: error.message || '修改失败',
                    status: -1
                });
                next()
            })
    },
    operate.operateEnd()
);

/**
 * 获取服务商配置信息
 */
router.get('/config', (req, res)=> {

    bindServer.getServerConfig()
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            res.json({
                tag: 'error',
                message: error.message,
                status: -1
            })
        })
});

router.get('/list', joiValidator({
    query: {
        limit: Joi.number().integer().min(1).max(100).required(),
        offset: Joi.number().min(0),
        _: Joi.any(),
        accountName: Joi.string(),
        accountSystem: Joi.string()
    }
}), (req, res)=> {

    let {
        offset,
        limit,
        accountName,
        accountSystem
    } = req.query;

    bindServer.getBindList({
        offset: offset,
        limit: limit,
        accountName,
        accountSystem
    })
        .then((data)=> {
            return res.dtResponse(data.data, {
                count: data.count
            });
        })
});

/**
 * 获取单个账户的详情
 */
router.get('/query', joiValidator({
    query: {
        id: Joi.number().required()
    }
}), (req, res)=> {
    let {id} = req.query;

    bindServer.getOneAccount({
        id: id
    })
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            res.json({
                tag: 'error',
                status: -1,
                message: error.message
            })
        })
});

router.post('/pay/test',
    operate.operateWrite('account_pay_test'),
    joiValidator({
        body: {
            type: Joi.string().required(),
            configId: Joi.number().required(),
            sellerId: Joi.string().empty(''),
            accountType: Joi.string()
        }
    }), (req, res, next)=> {
        const ip = baseServer.getIp(req);
        let {
            type,
            configId,
            accountType,
            sellerId
        } = req.body;

        if (accountType === 'self') {
            sellerId = '';
        }

        bindServer.payTest({
            type: type,
            ip: ip,
            configId: configId,
            accountType: accountType,
            sellerId: sellerId
        })
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
                    message: error.message || '修改失败',
                    status: -1
                });
                next()
            })

    }, operate.operateEnd());

module.exports = router;
