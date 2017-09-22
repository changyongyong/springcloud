'use strict';

/**
 * @author WXP
 * @description 各种映射，以下所有的_TRANS均代表为翻译为中文
 */
const _ = require('lodash');

const SYSTEMS_TRANS = {
    DD_PAY: '账户系统',
    api_server: '订单系统',
    delivery_app: '配送系统',
    business_server: '生意宝',
    customer_api_server: '小程序',
    THIRD_SYSTEM: '第三方',
    test: '测试'
};
const SYSTEMS_ARR = Object.keys(SYSTEMS_TRANS);
const SYSTEMS = toPairs(SYSTEMS_ARR);

const PAYMENT_REFUND_STATUS_TRANS = {
    NONE: '未退款',
    PART: '部分退款',
    ALL: '全额退款'
};
const PAYMENT_REFUND_STATUS_ARR = Object.keys(PAYMENT_REFUND_STATUS_TRANS);
const PAYMENT_REFUND_STATUS = toPairs(PAYMENT_REFUND_STATUS_ARR);

const PAYMENT_ORDER_TYPES_TRANS = {
    '店达-充值押金': '猪行侠-充值押金',
    '店达商城-订单': '店达商城-订单',
    goods_pay: '配送交货款',
    test: '测试',
    PAYMENT_CHARGE_DEPOSIT: '猪行侠-充值押金',
    '小程序-订单': '小程序-订单',
    USER_ORDER: '生意宝-订单'
};

const PAYMENT_ORDER_TYPES_ARR = Object.keys(PAYMENT_ORDER_TYPES_TRANS);
const PAYMENT_ORDER_TYPES = toPairs(PAYMENT_ORDER_TYPES_ARR);

const REFUND_ORDER_TYPES_TRANS = {
    '店达-充值押金': '猪行侠-充值押金',
    '店达商城-订单': '店达商城-订单',
    goods_pay: '配送交货款',
    test: '测试',
    PAYMENT_CHARGE_DEPOSIT: '猪行侠-充值押金'
};

const REFUND_ORDER_TYPES_ARR = Object.keys(REFUND_ORDER_TYPES_TRANS);
const REFUND_ORDER_TYPES = toPairs(REFUND_ORDER_TYPES_ARR);

const TRANSFER_ORDER_TYPES_TRANS = {
    withdrawCash: '提现'
};

const TRANSFER_ORDER_TYPES_ARR = Object.keys(TRANSFER_ORDER_TYPES_TRANS);
const TRANSFER_ORDER_TYPES = toPairs(TRANSFER_ORDER_TYPES_ARR);

const STATUS_TRANS = {
    SUCCESS: '成功',
    FAIL: '失败',
    PENDDING: '处理中'
};
const STATUS_ARR = Object.keys(STATUS_TRANS);
const STATUS = toPairs(STATUS_ARR);

const TRANSFER_STATUS_TRANS = _.defaults({
    USER_INFO_ERROR: '失败-用户信息错误'
}, STATUS_TRANS);

const TRANSFER_STATUS_ARR = Object.keys(TRANSFER_STATUS_TRANS);
const TRANSFER_STATUS = toPairs(TRANSFER_STATUS_ARR);

const WE_CHAT_SOURCE_TRANS = {
    psapp: '微信-猪行侠',
    dd528: '微信-商城',
    ddapp: '微信-商城',
    wxmp: '微信-小程序',
    bsapp: '微信-生意宝'
};
const WE_CHAT_SOURCE_ARR = Object.keys(WE_CHAT_SOURCE_TRANS);
const WE_CHAT_SOURCE = toPairs(WE_CHAT_SOURCE_ARR);

const TRADE_CHANNEL_TRANS = {
    WE_CHAT_PAY_APP: '微信-APP支付',
    ALI_PAY_APP: '支付宝-APP支付',
    WE_CHAT_PAY_NATIVE: '微信-扫码支付',
    ALI_PAY_UNION: '支付宝-扫码支付',
    WE_CHAT_PAY_JSAPI: '微信-小程序付款',
    WE_CHAT_PAY_SCAN_PAY: '微信-条码支付',
    ALI_PAY_SCAN_PAY: '支付宝-条码支付'
};
const TRADE_CHANNEL_ARR = Object.keys(TRADE_CHANNEL_TRANS);
const TRADE_CHANNEL = toPairs(TRADE_CHANNEL_ARR);

const MAIN_TRADE_CHANNEL_TRANS = {
    WE_CHAT: '微信支付',
    ALI_PAY: '支付宝',
    OTHER: '其它'
};
const MAIN_TRADE_CHANNEL_ARR = Object.keys(MAIN_TRADE_CHANNEL_TRANS);

const MAIN_TRADE_CHANNEL = toPairs(MAIN_TRADE_CHANNEL_ARR);

const MAIN_CHANNEL_SUB_CHANNEL = {
    WE_CHAT: ['WE_CHAT_PAY_APP', 'WE_CHAT_PAY_NATIVE', 'WE_CHAT_PAY_JSAPI', 'WE_CHAT_PAY_SCAN_PAY'],
    ALI_PAY: ['ALI_PAY_APP', 'ALI_PAY_UNION', 'ALI_PAY_SCAN_PAY']
};

/**
 * 区分主渠道，微信支付宝，其它
 * @param {string} channel
 * @return {string} WE_CHAT|ALI_PAY|OTHER
 */
const distributeMainTradeChannel = function (channel) {
    let sevenChar = channel.slice(0, 7);
    switch (sevenChar) {
        case 'WE_CHAT':
            return 'WE_CHAT';
        case 'ALI_PAY':
            return 'ALI_PAY';
        default:
            return 'OTHER'
    }
};

function toPairs(data) {
    let result = {};
    for (let key of data) {
        result[key] = key;
    }
    return result;
}

// 'DD_PAY': '账户系统',
// 'api_server': '订单系统',
// 'delivery_app': '配送系统',
// 'business_server': '生意宝',
// 'customer_api_server': '小程序'
const API_SERVER_PAYMENT_ORDER_TYPE = {
    order: '商城-订单'
};
const DELIVERY_APP_PAYMENT_ORDER_TYPE = {
    goods_pay: '配送-交货款'
};
const BUSINESS_SERVER_PAYMENT_ORDER_TYPE = {
    border: '生意宝-订单'
};
const CUSTOMER_API_SERVER_PAYMENT_ORDER_TYPE = {
    corder: '小程序-订单'
};

const DD_PAY_SYSTEM = {
    delivery_app: '配送APP',
    business_server: '生意宝',
    THIRD_SYSTEM: '第三方系统'
};

const DD_PAY_PAYMENT_ORDER_TYPE = {
    deposit: '充值押金',
    balance: '充值余额'
};

const ddpayPaymentOrderType = function (record) {
    let [system, orderType] = record.orderType.split('|');
    return `${DD_PAY_SYSTEM[system] || '其它'}-${DD_PAY_PAYMENT_ORDER_TYPE[orderType] || '其它'}`
};

function paymentOrderType(record) {
    switch (record.system) {
        case SYSTEMS.api_server:
            return API_SERVER_PAYMENT_ORDER_TYPE[record.orderType] || '商城-订单';
        case SYSTEMS.delivery_app:
            return DELIVERY_APP_PAYMENT_ORDER_TYPE[record.orderType];
        case SYSTEMS.business_server:
            return BUSINESS_SERVER_PAYMENT_ORDER_TYPE[record.orderType];
        case SYSTEMS.customer_api_server:
            return CUSTOMER_API_SERVER_PAYMENT_ORDER_TYPE[record.orderType];
        case SYSTEMS.DD_PAY:
            return ddpayPaymentOrderType(record);
        default:
            return '其它';
    }
}

const M_ALI_SOURCE = ['bsapp'];  //支付宝-米洱+


const DD_ALI_SOURCE = ['psapp', 'dd528', 'ddapp', 'ALI3', 'ALI4', 'ALI5'];  //支付宝-店达

//前端source 对应的 数据库（channel+source）的映射
const WEB_SOURCE_MAPPING = {
    mAli: ['支付宝-米洱', MAIN_CHANNEL_SUB_CHANNEL['ALI_PAY'], M_ALI_SOURCE],  // 【名称，channel，source】
    ddAli: ['支付宝-店达', MAIN_CHANNEL_SUB_CHANNEL['ALI_PAY'], DD_ALI_SOURCE],
    dd528: ['微信-商城', MAIN_CHANNEL_SUB_CHANNEL['WE_CHAT'], [WE_CHAT_SOURCE.dd528, WE_CHAT_SOURCE.ddapp]],
    wxmp: ['微信-小程序', MAIN_CHANNEL_SUB_CHANNEL['WE_CHAT'], WE_CHAT_SOURCE.wxmp],
    bsapp: ['微信-生意宝', MAIN_CHANNEL_SUB_CHANNEL['WE_CHAT'], WE_CHAT_SOURCE.bsapp],
    psapp: ['微信-猪行侠', MAIN_CHANNEL_SUB_CHANNEL['WE_CHAT'], WE_CHAT_SOURCE.psapp]
};
const WEB_SOURCE_MAPPING_ARR = Object.keys(WEB_SOURCE_MAPPING);

const SYSTEMS_TO_STR = {  //数据库SYSTEM对应的汉字显示
    DD_PAY: '账户系统',
    api_server: '订单系统',
    delivery_app: '配送系统',
    business_server: '生意宝(B端)',
    business_api_server: '生意宝(B端)',
    customer_api_server: '生意宝(小程序)',
    THIRD_SYSTEM: '第三方',
    test: '测试',
    'SHENYIBAO.QRCODE_BORDER': '生意宝(B端)',
    'SHENYIBAO.QRCODE_ACCOUNT': '生意宝(B端)',
    'SHENYIBAO.QRCODE_DEPOSIT': '生意宝(B端)',

    //退款的情况
    'SHENYIBAO.QRCODE_CORDER': '生意宝(小程序)',

    //转账的情况
    'SHENYIBAO':'生意宝(小程序)',
    'SHENYIBAO.ACCOUNT':'生意宝(B端)'
};

//数据库(SYSTEM+','+orderType)对应的汉字显示
const ORDERTYPE_TO_STR = {
    'api_server,order': '店达商城-订单',
    'delivery_app,goods_pay': '猪行侠-交货款',
    'delivery_app,user_goods_pay': '猪行侠-用户扫描付',
    'DD_PAY,delivery_app|deposit': '猪行侠-押金充值',
    'DD_PAY,THIRD_SYSTEM|balance': '第三方-预存款充值',
    'customer_api_server,corder': '生意宝-小程序-订单',
    'business_server,border': '生意宝-订单',
    'business_server,B_ACCOUNT_BALANCE': '生意宝-主账户充值',
    'business_server,B_LIFE_ACCOUNT_BALANCE': '生意宝-生活服务户充值',
    'business_server,B_LIFE_ACCOUNT_BALANCE_APPLY': '生意宝-预约金充值',
    'business_server,B_LIFE_ACCOUNT_DES_APPLY': '生意宝-押金充值',
    'test,test': '测试',
    'SHENYIBAO.QRCODE_CORDER,CORDER': '生意宝-小程序-订单', //java
    'SHENYIBAO.QRCODE_BORDER,BORDER': '生意宝-订单', //java
    'SHENYIBAO.QRCODE_ACCOUNT,MACCOUNT_RECHARGE': '生意宝-主账户充值', //java
    'SHENYIBAO.QRCODE_ACCOUNT,SACCOUNT_RECHARGE': '生意宝-生活服务户充值', //java
    'SHENYIBAO.QRCODE_DEPOSIT,SACCOUNT_PRE_DEPOSIT': '生意宝-预约金充值',//java
};

const WEB_ORDERTYPE_MAPPING_ARR = Object.keys(ORDERTYPE_TO_STR);

//数据库中所有的source情况
const DB_SOURCE_ARR = ['dd528', 'psapp', 'ddapp', 'wxmp', 'bsapp'];

//页面的下拉菜单 核验类型
const WEB_VALIDATE_STATE = ['all', '-all', '99', '-97', '-98', '-99', '-1'];


//页面的下拉  交易类型  对应的 [system , orderType]
const WEB_PAYMENT_ORDER_TYPE = {
    'mall': [['api_server', 'order']], // '商城'
    'mall:order': [['api_server', 'order']],//'|--订单'
    'delivery_app': [ //'猪行侠'
        ['delivery_app', 'goods_pay'],
        ['delivery_app', 'user_goods_pay'],
        ['DD_PAY', 'delivery_app|deposit']
    ],
    'delivery_app:goods_pay': [['delivery_app', 'goods_pay']],//'|--交货款'
    'delivery_app:user_goods_pay': [['delivery_app', 'user_goods_pay']],//'|--用户扫描付'
    'delivery_app:deposit': [['DD_PAY', 'delivery_app|deposit']],//'|--押金充值'
    'third': [['DD_PAY', 'THIRD_SYSTEM|balance']],//'第三方'
    'third:balance': [['DD_PAY', 'THIRD_SYSTEM|balance']],//|--预存款充值
    'syb': [    //'生意宝'
        ['customer_api_server', 'corder'],
        ['business_server', 'border'],
        ['business_server', 'B_ACCOUNT_BALANCE'],
        ['business_server', 'B_LIFE_ACCOUNT_BALANCE'],
        ['business_server', 'B_LIFE_ACCOUNT_BALANCE_APPLY'],
        ['business_server', 'B_LIFE_ACCOUNT_DES_APPLY'],
        ['SHENYIBAO.QRCODE_CORDER', 'CORDER'], //java
        ['SHENYIBAO.QRCODE_BORDER', 'BORDER'], //java
        ['SHENYIBAO.QRCODE_ACCOUNT', 'MACCOUNT_RECHARGE'], //java
        ['SHENYIBAO.QRCODE_ACCOUNT', 'SACCOUNT_RECHARGE'], //java
        ['SHENYIBAO.QRCODE_DEPOSIT', 'SACCOUNT_PRE_DEPOSIT'], //java
    ],
    'syb:corder': [//'|--小程序-订单'
        ['customer_api_server', 'corder'], //node
        ['SHENYIBAO.QRCODE_CORDER', 'CORDER'] //java
    ],
    'syb,border': [//'|--门店-订单'
        ['business_server', 'border'], //node
        ['SHENYIBAO.QRCODE_BORDER', 'BORDER'] //java
    ],
    'syb,B_ACCOUNT_BALANCE': [  //'|--主账户充值'
        ['business_server', 'B_ACCOUNT_BALANCE'],//node
        ['SHENYIBAO.QRCODE_ACCOUNT', 'MACCOUNT_RECHARGE'] //java
    ],
    'syb,B_LIFE_ACCOUNT_BALANCE': [//'|--生活服务户充值'
        ['business_server', 'B_LIFE_ACCOUNT_BALANCE'],//node
        ['SHENYIBAO.QRCODE_ACCOUNT', 'SACCOUNT_RECHARGE'] //java
    ],
    'syb,B_LIFE_ACCOUNT_BALANCE_APPLY': [//'|--预约金充值'
        ['business_server', 'B_LIFE_ACCOUNT_BALANCE_APPLY'], //node
        ['SHENYIBAO.QRCODE_DEPOSIT', 'SACCOUNT_PRE_DEPOSIT'] //java
    ],
    'syb,B_LIFE_ACCOUNT_DES_APPLY': [['business_server', 'B_LIFE_ACCOUNT_DES_APPLY']],// '|--押金充值'
    'test': [['test', 'test']] //'测试'
};

const WEB_PAYMENT_ORDER_TYPE_ARR = Object.keys(WEB_PAYMENT_ORDER_TYPE);

module.exports = {
    SYSTEMS: SYSTEMS,
    SYSTEMS_ARR: SYSTEMS_ARR,
    SYSTEMS_TRANS: SYSTEMS_TRANS,
    STATUS: STATUS,
    STATUS_ARR: STATUS_ARR,
    STATUS_TRANS: STATUS_TRANS,
    TRANSFER_STATUS: TRANSFER_STATUS,
    TRANSFER_STATUS_ARR: TRANSFER_STATUS_ARR,
    TRANSFER_STATUS_TRANS: TRANSFER_STATUS_TRANS,
    PAYMENT_ORDER_TYPES: PAYMENT_ORDER_TYPES,
    PAYMENT_ORDER_TYPES_TRANS: PAYMENT_ORDER_TYPES_TRANS,
    PAYMENT_ORDER_TYPES_ARR: PAYMENT_ORDER_TYPES_ARR,
    PAYMENT_REFUND_STATUS: PAYMENT_REFUND_STATUS,
    PAYMENT_REFUND_STATUS_TRANS: PAYMENT_REFUND_STATUS_TRANS,
    PAYMENT_REFUND_STATUS_ARR: PAYMENT_REFUND_STATUS_ARR,
    REFUND_ORDER_TYPES: REFUND_ORDER_TYPES,
    REFUND_ORDER_TYPES_TRANS: REFUND_ORDER_TYPES_TRANS,
    REFUND_ORDER_TYPES_ARR: REFUND_ORDER_TYPES_ARR,
    TRANSFER_ORDER_TYPES: TRANSFER_ORDER_TYPES,
    TRANSFER_ORDER_TYPES_TRANS: TRANSFER_ORDER_TYPES_TRANS,
    TRANSFER_ORDER_TYPES_ARR: TRANSFER_ORDER_TYPES_ARR,
    WE_CHAT_SOURCE: WE_CHAT_SOURCE,
    WE_CHAT_SOURCE_ARR: WE_CHAT_SOURCE_ARR,
    WE_CHAT_SOURCE_TRANS: WE_CHAT_SOURCE_TRANS,
    MAIN_TRADE_CHANNEL: MAIN_TRADE_CHANNEL,
    MAIN_TRADE_CHANNEL_ARR: MAIN_TRADE_CHANNEL_ARR,
    MAIN_TRADE_CHANNELS_TRANS: MAIN_TRADE_CHANNEL_TRANS,
    MAIN_CHANNEL_SUB_CHANNEL: MAIN_CHANNEL_SUB_CHANNEL,
    TRADE_CHANNEL: TRADE_CHANNEL,
    TRADE_CHANNEL_ARR: TRADE_CHANNEL_ARR,
    TRADE_CHANNEL_TRANS: TRADE_CHANNEL_TRANS,
    distributeMainTradeChannel: distributeMainTradeChannel,
    paymentOrderType: paymentOrderType,
    M_ALI_SOURCE: M_ALI_SOURCE,
    DD_ALI_SOURCE: DD_ALI_SOURCE,
    WEB_SOURCE_MAPPING: WEB_SOURCE_MAPPING,
    WEB_SOURCE_MAPPING_ARR: WEB_SOURCE_MAPPING_ARR,
    SYSTEMS_TO_STR: SYSTEMS_TO_STR,
    ORDERTYPE_TO_STR: ORDERTYPE_TO_STR,
    WEB_ORDERTYPE_MAPPING_ARR: WEB_ORDERTYPE_MAPPING_ARR,
    DB_SOURCE_ARR: DB_SOURCE_ARR,
    WEB_VALIDATE_STATE: WEB_VALIDATE_STATE,
    WEB_PAYMENT_ORDER_TYPE: WEB_PAYMENT_ORDER_TYPE,
    WEB_PAYMENT_ORDER_TYPE_ARR: WEB_PAYMENT_ORDER_TYPE_ARR
};