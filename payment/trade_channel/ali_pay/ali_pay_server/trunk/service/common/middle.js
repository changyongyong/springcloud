/**
 * Created by wt on 2017/7/3.
 */

/**
 * 检查source
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
module.exports.sourceCheckMiddleware = function (req, res, next) {
    let source = req.query.source || req.body.source;
    if (!source) {
        return res.json({
            tag: 'error',
            status: -1,
            message: '缺少source，订单来源'
        })
    }

    next();
};
