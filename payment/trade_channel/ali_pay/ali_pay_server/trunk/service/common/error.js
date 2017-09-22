/**
 * Created by SEELE on 2017/6/29.
 */

const SCAN_PAY_CLEARLY_ERROR = {
    // 'ACQ.SYSTEM_ERROR': '接口返回错误',
    'ACQ.INVALID_PARAMETER': '支付失败！请通知管理员',
    'ACQ.ACCESS_FORBIDDEN': '无权限使用接口！请通知管理员',
    'ACQ.EXIST_FORBIDDEN_WORD': '订单信息中包含违禁词，无法支付！',
    'ACQ.PARTNER_ERROR': '支付失败！请通知管理员',
    'ACQ.TOTAL_FEE_EXCEED': '订单总金额超过限额，请降低支付金额',
    'ACQ.PAYMENT_AUTH_CODE_INVALID': '支付授权码无效，请刷新重试',
    'ACQ.CONTEXT_INCONSISTENT': '交易信息被篡改，请重新下单',
    'ACQ.TRADE_HAS_SUCCESS': '交易已被支付',
    'ACQ.TRADE_HAS_CLOSE': '交易已经关闭',
    'ACQ.BUYER_BALANCE_NOT_ENOUGH': '买家余额不足',
    'ACQ.BUYER_BANKCARD_BALANCE_NOT_ENOUGH': '买家银行卡余额不足',
    'ACQ.ERROR_BALANCE_PAYMENT_DISABLE': '买家余额支付功能关闭，请前往支付宝打开余额支付功能',
    'ACQ.BUYER_SELLER_EQUAL': '买卖家不能相同',
    'ACQ.TRADE_BUYER_NOT_MATCH': '交易买家不匹配，请第一位被扫码用户支付',
    'ACQ.BUYER_ENABLE_STATUS_FORBID': '买家状态非法，请联系支付宝',
    'ACQ.PULL_MOBILE_CASHIER_FAIL': '支付失败，请买家刷新条码重试',
    'ACQ.MOBILE_PAYMENT_SWITCH_OFF': '买家的无线支付开关关闭，请在前往支付宝打开无线支付',
    'ACQ.PAYMENT_FAIL': '支付失败，请买家刷新条码重试',
    'ACQ.BUYER_PAYMENT_AMOUNT_DAY_LIMIT_ERROR': '买家付款日限额超限',
    'ACQ.BEYOND_PAY_RESTRICTION': '商户收款额度超限',
    'ACQ.BEYOND_PER_RECEIPT_RESTRICTION': '商户收款金额超过月限额',
    'ACQ.BUYER_PAYMENT_AMOUNT_MONTH_LIMIT_ERROR': '买家付款月额度超限',
    'ACQ.SELLER_BEEN_BLOCKED': '支付失败！请通知管理员',
    'ACQ.ERROR_BUYER_CERTIFY_LEVEL_LIMIT': '买家未通过人行认证，请咨询支付宝客服',
    'ACQ.PAYMENT_REQUEST_HAS_RISK': '支付有风险，此订单无法支付宝支付，请使用其它方式支付！',
    'ACQ.NO_PAYMENT_INSTRUMENTS_AVAILABLE': '没用可用的支付工具，此订单无法支付宝支付，请使用其它方式支付！',
    'ACQ.USER_FACE_PAYMENT_SWITCH_OFF': '	用户当面付付款开关关闭，请在前往支付宝打开当面付付款开关',
    'ACQ.INVALID_STORE_ID': '商户门店编号无效！请通知管理员'
};

module.exports = SCAN_PAY_CLEARLY_ERROR;