/**
 * Created by SEELE on 2017/6/28.
 */

const router = require('express').Router();

const server = require('../../service');
const logger = require('../../utils/logger').Logger('router-alipay');

//todo 加上source的中间件
//  创建预支付订单
router.get('/create',  (req, res)=> {
    server.pay.create(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//  app在线创建支付订单
router.get('/app/preCreate', (req, res)=> {
    server.pay.appPay(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//  扫码支付
router.get('/scanPay',(req, res)=> {
    server.pay.scan(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//  退款
router.get('/refund', (req, res)=> {
    server.back.refund(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                message: '退款申请成功',
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//todo 还的再校验下这个接口
//  关闭订单
router.get('/close',  (req, res)=> {
    server.back.close(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                message: '关闭订单成功',
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//支付交易返回失败或支付系统超时，调用该接口撤销交易
//如果此订单用户支付失败，支付宝系统会将此订单关闭；
//如果用户支付成功，支付宝系统会将此订单资金退还给用户 TODO 非常危险的接口
router.get('/cancel',  (req, res)=> {
    server.back.cancel(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                message: '取消订单成功',
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//转账
router.get('/transfer', (req, res)=> {
    server.move.transfer(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                message: '操作成功',
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//获取支付资源
router.get('/sources', (req, res)=> {

    server.query.source()
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '查询失败'
            })
        })
});
//从本地查询交易记录 --- 本地交易记录会出现：1个订单出现多个交易记录，只有一个交易记录未关闭，其他应该都已经关闭
router.get('/queryTrx', (req, res)=> {
    server.query.trx(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//查询订单信息  需要调用查询接口的情况： 当商户后台、网络、服务器等出现异常，商户系统最终未接收到支付通知；
//调用支付接口后，返回系统错误或未知交易状态情况； 调用alipay.trade.pay，
// 返回INPROCESS的状态； 调用alipay.trade.cancel之前，需确认支付状态；
router.get('/queryOrder', (req, res)=> {
    server.query.order(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//退款结果查询
router.get('/refundQuery', (req, res)=> {

    server.query.refund(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//转账结果查询
router.get('/transferQuery', (req, res)=> {
    server.query.transfer(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                message: '响应成功,具体是否成功,请用data.status判断',
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//  查询账单
router.get('/bill', (req, res)=> {
    server.query.bill(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});
//  查询对账记录
router.get('/:type/record', (req, res)=> {
    let body = Object.assign(req.query,req.params);
    server.query.record(body)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '创建失败'
            })
        })
});

router.get('/authUrl', (req, res)=> {
    server.query.auth(req.query)
        .then((data)=> {
            res.json({
                tag: 'success',
                status: 1,
                data: data
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '获取authUrl 失败'
            })
        })
});

router.post('/addAccount', (req, res)=> {
    server.account.add(req.body)
        .then(()=> {
            res.json({
                tag: 'success',
                status: 1
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                tag: 'error',
                status: error.status || -1,
                message: typeof error === 'string' && error || error.message || '添加账户 失败'
            })
        })
});

module.exports = router;
