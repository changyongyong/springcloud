# tradeGateway相关服务
说明：
- 假设RPC返回数据为: data则http请求返回数据为{ "tag": "success","status": 1, "data": data}
- orderId 和 orderType 为防重参数，必填。
- Http请求返回结果中，status为-99时为请求失败，所有参数失败需要参数校验。
---

## WeChatPay _微信支付相关_
### Payment 支付相关
#### WeChatPay.Payment.create 创建支付
##### POST /api/weChatPay/payment/create
创建支付，返回调用支付所需参数
``` javascript
//请求参数
{
    fee: '交易金额',
    orderId: '订单ID',
    orderType: '订单类型',
    system: '来源系统',
    remark: '交易备注',
    openId: '渠道为WE_CHAT_PAY_JSAPI必传参数',
    tradeType: '交易类型',
    body: '商品名称 APP——需传入应用市场上的APP名字-实际商品名称，比如天天爱消除-游戏充值。',
    spbillCreateIp: '客户端IP',
    source: '来源：dd528 | ddapp | psapp | bsapp(生意宝)',
    noCredit: '不能使用信用卡：1禁止，0不禁止，默认为0',
    timeExpire: '预计过期时间YYYYMMDDHHmmss：比如：20170222160021 在2017-02-22 16:00:21会被关闭。必须比当前时间大',
    tradePrincipal: '英文32位 交易主体，用于区分不同的业务。城市ID'
}
//目前支持的交易类型 tradeType
{
    JSAPI: '微信支付：JSAPI'
    APP: '微信支付：APP'
    NATIVE: '微信支付：NATIVE'
}
//NATIVE返回结果
{
    "codeUrl": "访问地址：weixin://wxpay/bizpayurl?pr=5JV9kcs",
    "tradeRecordNo": "交易号：test_123456_1486468125860"
}  
//APP返回结果
{
    "tradeRecordNo": "PAYMENT201702111000301",
    "appParams": {
      "appid": "wx0760d57c26778206",
      "partnerid": "1439347102",
      "timestamp": "1486801308",
      "noncestr": "lapzaDINiX14PkIH",
      "prepayid": "wx201702111622151de49614d50407845184",
      "package": "Sign=WXPay",
      "sign": "2F92DED73E15141CF741218E2F98D882"
    }
}
//JSAPI返回结果
{
    "mpParams": {
      "nonceStr": "4MJhHLc8trrRVi4j",
      "prepayId": "wx2017030916184055ccb59f980583539434",
      "timeStamp": 1489047487,
      "signType": "MD5",
      "signStr": "EA22E5800E4E74B932DCE7463C0EE18B",
      "outTradeNo": "PAYMENT201703091001005"
    },
    "tradeRecordNo": "PAYMENT201703091001005"
}
```

#### WeChatPay.Payment.scanPay 扫码支付
##### POST /api/weChatPay/payment/scanPay
创建支付，返回调用支付所需参数
``` javascript
//请求参数
{
    fee: '交易金额',
    orderId: '订单ID',
    orderType: '订单类型',    
    system: '来源系统',
    remark: '交易备注',
    body: '商品名称 APP——需传入应用市场上的APP名字-实际商品名称，比如天天爱消除-游戏充值。',
    spbillCreateIp: '客户端IP',
    source: '来源：dd528 | ddapp | psapp | bsapp(生意宝)',
    noCredit: '不能使用信用卡：1禁止，0不禁止，默认为0',
    authCode: '扫码得到的授权码',
    timeExpire: '预计过期时间YYYYMMDDHHmmss：比如：20170222160021 在2017-02-22 16:00:21会被关闭。必须比当前时间大',
    tradePrincipal: '英文32位 交易主体，用于区分不同的业务。城市ID'
}
//返回结果
{
    "tradeRecordNo": "PAYMENT201702111000301",
    "status": "SUCCESS，PENDING"
}
```
---

## AliPay _支付宝相关服务_
### Payment 支付相关
#### AliPay.Payment.create 创建支付
##### POST /api/aliPay/payment/create
创建支付，返回调用支付所需参数
``` javascript
//请求参数
{
    fee: '交易金额',
    orderId: '订单ID',
    orderType: '订单类型',
    system: '来源系统',
    remark: '交易备注',
    tradeType: '交易类型',
    body: '商品名称 APP——需传入应用市场上的APP名字-实际商品名称，比如天天爱消除-游戏充值。'备注,
    subject: '订单标题',
    source: '来源：dd528 | ddapp | psapp | bsapp(生意宝)',
    noCredit: '不能使用信用卡：1禁止，0不禁止，默认为0',
    timeExpire: '预计过期时间YYYYMMDDHHmmss：比如：20170222160021 在2017-02-22 16:00:21会被关闭。必须比当前时间大',
    tradePrincipal: '英文32位 交易主体，用于区分不同的业务。城市ID'
}
//目前支持的交易类型 tradeType
{
    APP: '支付宝支付：APP'
    UNION: '支付宝支付：统一下单'
}
//返回结果
{
    "codeUrl": "APP或者网站需要的地址",
    "tradeRecordNo": "交易号"
}
```
---

#### AliPay.Payment.scanPay 创建扫码支付
##### POST /api/aliPay/payment/scanPay
创建支付，返回调用支付所需参数
``` javascript
//请求参数
{
    fee: '交易金额',
    orderId: '订单ID',
    orderType: '订单类型',    
    system: '来源系统',
    remark: '交易备注',
    body: '商品名称 APP——需传入应用市场上的APP名字-实际商品名称，比如天天爱消除-游戏充值。'备注,
    subject: '订单标题',
    source: '来源：dd528 | ddapp | psapp | bsapp(生意宝)',    
    noCredit: '不能使用信用卡：1禁止，0不禁止，默认为0',
    authCode: '扫码得到的授权码',
    timeExpire: '预计过期时间YYYYMMDDHHmmss：比如：20170222160021 在2017-02-22 16:00:21会被关闭。必须比当前时间大',    
    tradePrincipal: '英文32位 交易主体，用于区分不同的业务。城市ID'
}
//目前支持的交易类型 tradeType
{
    APP: '支付宝支付：APP'
    UNION: '支付宝支付：统一下单'
}
//返回结果
{
    "tradeRecordNo": "交易号",
    "status": "SUCCESS，PENDING"
}
```
---

## Refund _退款相关_
### Refund.refund _退款相关_
### /api/refund/refund 退款
``` javascript
//请求参数
{
    orderId: '此次退款的单号',
    orderType: '此次退款的单据类型',
    system: '此次退款的系统',
    remark: '备注',
    originalOrderId: '被退款单据的ID',
    originalTradeType: '被退款单据的类型',
    originalSystem: '被退款单据的系统',
    tradeRecordNo: '被退款单据的交易号',
    refundFee: '退款金额',
    totalFee: '原总计金额',
}
//通过originalOrderId，originalTradeType，originalSystem确定被退款单据的交易号
//以上三个参数的作用等同于tradeRecordNo，即可只传tradeRecordNo来替代上述三个参数


//返回结果
// 当支付状态为待支付或者支付失败时无返回值
// 当支付状态为成功支付时返回值为
{
    tradeRecordNo: '被退款单据的交易号',
    outRefundNo: '此次退款单据的退款号'
}
```

# Transfer _转账_
## Transfer.transfer _转账_
### POST /api/transfer/transfer
``` javascript
//请求参数
{
    orderId: '转账单据单号',
    orderType: '转账单据类型',
    system: '此次退款的系统',
    remark: '备注，选填',
    fee: '转账金额',
    source: '同其它source',
    thirdPartAccount: '被退款单据的ID',
    realName: '用户真实姓名',
    tradeType: '退款类型：ALI_PAY',
    tradePrincipal: '英文32位 交易主体，用于区分不同的业务。城市ID'    
}
//通过originalOrderId，originalTradeType，originalSystem确定被退款单据的交易号
//以上三个参数的作用等同于tradeRecordNo，即可只传tradeRecordNo来替代上述三个参数


//返回结果
// 当支付状态为待支付或者支付失败时无返回值
// 当支付状态为成功支付时返回值为
{
    tradeRecordNo: '此次转账单号'
}
```

# MQ绑定
### 支付成功消息绑定
支付成功需要绑定交换(exchange) tradeGateway.paymentResult ，绑定需要的routingKey为参数中的system
``` javascript
{
    messageId: '消息编号，唯一不重',
    data: {
        status: '支付状态：["SUCCESS","PENDDING"(支付中),"FAIL"]',
        tradeRecordNo: '交易单号',
        system: '参数中的system',
        orderId: '参数中的orderId',
        orderType: '参数中的orderType',
        source: '参数中的source',
        tradeChannel: '支付渠道：参考支付时的参数
        [
            WE_CHAT_PAY_NATIVE,
            WE_CHAT_PAY_APP,
            WE_CHAT_PAY_SCAN_PAY,
            WE_CHAT_PAY_JSAPI,
            ALI_PAY_APP,
            ALI_PAY_UNION,
            ALI_PAY_SCAN_PAY,
        ]',
        type: 'payment',
        message: '错误信息'
    }
}
```

### 支付成功消息绑定
支付成功需要绑定交换(exchange) tradeGateway.refundResult ，绑定需要的routingKey为参数中的system
``` javascript
{
    messageId: '消息编号，唯一不重',
    data: {
        status: '退款状态：["SUCCESS","PENDDING"(支付中),"FAIL"]',
        tradeRecordNo: '交易单号',
        system: '参数中的system',
        orderId: '参数中的orderId',
        orderType: '参数中的orderType',
        source: '参数中的source',
        tradeChannel: '支付渠道，同支付时的支付消息：参考支付时的参数
        [
            WE_CHAT_PAY_NATIVE,
            WE_CHAT_PAY_APP,
            WE_CHAT_PAY_SCAN_PAY,
            WE_CHAT_PAY_JSAPI,
            ALI_PAY_APP,
            ALI_PAY_UNION,
            ALI_PAY_SCAN_PAY,
        ]',
        type: 'refund',
        message: '错误信息'
    }
}
```
