/**
 * Created by SEELE on 2017/7/5.
 */

const db = require('../../models/tradeGatewayDb');
const OperateLog = db.OperateLog;
const ID_START = global.SYSTEM + '_' + process.pid;

function operateWrite(type) {
    return function (req, res, next) {
        let body = Object.assign(req.params, req.body, req.query);
        return OperateLog.create({
            params: JSON.stringify(body),
            operate: type,
            status: OperateLog.getStatus().PENDING,
            operateLogNo: `${ID_START}_${Date.now()}_${parseInt(Math.random() * 100)}`,
            operator: body.operator
        })
            .then((data)=> {
                req.operateId = data.id;
                return next()
            })
            .catch((error)=> {
                res.json({
                    tag: 'error',
                    message: error.message,
                    status: -1
                })
            })
    }
}

function operateEnd() {
    let updateInfo = {};
    return function (req, res) {
        if (!req.operateId) {
            return res.end()
        }

        if (req.operate) {
            updateInfo = {
                status: OperateLog.getStatus().SUCCESS
            }
        } else {
            updateInfo = {
                status: OperateLog.getStatus().FAIL,
                error: JSON.stringify(req.error)
            }
        }
        //  修改最终的状态
        OperateLog.update(updateInfo, {
            where: {
                id: req.operateId
            }
        });
        res.end();
    }
}

module.exports = {
    //  日志记录头
    operateWrite: operateWrite,
    //  日志记录结尾
    operateEnd: operateEnd
};