# 关于签名！！！
- 参考微信支付的签名方式https://pay.weixin.qq.com/wiki/doc/api/micropay.php?chapter=4_3
- 注意：默认对所有的value进行encodeUri，比如%转化为%25，店转换为%E5%BA%97，{test:'店'}转换为test=%E5%BA%97
- 签名助手地址： http://192.168.1.202:52310/util/sign
- 签名助手的密码 admin/ddxx2017
- 所有请求需要增加
    - onceStr：随机字符串，会通过它防重和防止sign重复
    - timestamp：unix时间戳，到秒，所有请求有效期5分钟
    - accountId: 对应需要支付到的账户ID
    - sign: 根据规则的签名结果



# tradeGateway相关服务
说明：
- 假设RPC返回数据为: data则http请求返回数据为{ "tag": "success","status": 1, "data": data}
- orderId 和 orderType 为防重参数，必填。
---

## WeChatPay _微信支付相关_
### Payment 支付相关
#### TradeGateway.WeChatPay.Payment.create 创建支付
##### POST /tradeGateway/weChatPay/payment/create
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
    openid: '渠道为WE_CHAT_PAY_JSAPI必传参数',
    body: '商品名称 APP——需传入应用市场上的APP名字-实际商品名称，比如天天爱消除-游戏充值。',
    spbillCreateIp: '客户端IP',
    noCredit: '不能使用信用卡：1禁止，0不禁止，默认为0',
    timeExpire: '预计过期时间YYYYMMDDHHmmss：比如：20170222160021 在2017-02-22 16:00:21会被关闭。必须比当前时间大',
    tradePrincipal: '英文32位 交易主体，用于区分不同的业务。城市ID',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
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

#### TradeGateway.WeChatPay.Payment.scanPay 扫码支付
##### POST /tradeGateway/weChatPay/payment/scanPay
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
    noCredit: '不能使用信用卡：1禁止，0不禁止，默认为0',
    timeExpire: '预计过期时间YYYYMMDDHHmmss：比如：20170222160021 在2017-02-22 16:00:21会被关闭。必须比当前时间大',
    tradePrincipal: '英文32位 交易主体，用于区分不同的业务。城市ID',
    authCode: '扫码得到的授权码',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
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
#### TradeGateway.AliPay.Payment.create 创建支付
##### POST /tradeGateway/aliPay/payment/create
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
    subject: '订单标题',
    body: '商品名称 APP——需传入应用市场上的APP名字-实际商品名称，比如天天爱消除-游戏充值。'备注,
    noCredit: '不能使用信用卡：1禁止，0不禁止，默认为0',
    tradePrincipal: '英文32位 交易主体，用于区分不同的业务。城市ID',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
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

#### TradeGateway.AliPay.Payment.scanPay 创建扫码支付
##### POST /tradeGateway/aliPay/payment/scanPay
创建支付，返回调用支付所需参数
``` javascript
//请求参数
{
    fee: '交易金额',
    orderId: '订单ID',
    orderType: '订单类型',    
    system: '来源系统',
    remark: '交易备注',
    subject: '订单标题',
    body: '商品名称 APP——需传入应用市场上的APP名字-实际商品名称，比如天天爱消除-游戏充值。'备注,
    noCredit: '不能使用信用卡：1禁止，0不禁止，默认为0',
    tradePrincipal: '英文32位 交易主体，用于区分不同的业务。城市ID',
    authCode: '扫码得到的授权码',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
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
### TradeGateway.Refund.refund _退款相关_
### /tradeGateway/refund/refund 退款
``` javascript
//请求参数
{
    originalOrderId: '被退款单据的ID',
    originalTradeType: '被退款单据的类型',
    originalSystem: '被退款单据的系统',
    tradeRecordNo: '被退款单据的交易号',
    refundFee: '退款金额',
    totalFee: '原总计金额',
    orderType: '此次退款的单据类型',
    orderId: '此次退款的单号',
    system: '此次退款的系统',
    remark: '备注',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
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

# ddpay相关服务
说明：
- 假设RPC返回数据为: data则http请求返回数据为{ "tag": "success","status": 1, "data": data}
- orderId 和 orderType 为防重参数，必填。
- 账户类型：COURIER: 配送员账户,BUSINESSMAN：生意宝主账户,THIRD_COMMISSION：第三方佣金,BUSINESSMAN_LIFE：生意宝生活账户,BUSINESSMAN_DEPOSIT：生意宝押金账户
## tradeAccount _交易账户相关服务_

```javascript
{
    type: '账户类型：BUSINESSMAN 为生意宝，COURIER 为猪行侠APP，THIRD_COMMISSION为第三方佣金'
}
```

### Ddpay.tradeAccount.create 创建交易账户
#### POST /ddpay/tradeAccount/create
创建交易账户时会先根据手机号，交易密码进行创建主账户account，而后创建交易账户，相同Account相同Type只允许一个处于启用状态
``` javascript
//请求参数
{
    type:'创建账户类型：BUSINESSMAN 为生意宝,  COURIER 为猪行侠APP THIRD_COMMISSION为第三方佣金',
    userName: '用户名',
    identityCardNo: '身份证号',
    phoneNum: '手机号',
    tradePwd: '交易密码',
    orderId: '己方账户ID',
    orderType: '系统_账户类型',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
}
//返回结果
{
    "tradeAccountNo": "交易账户号，与账户系统唯一关联：TZH1000018",
    "status": "账户状态，目前恒为99",
    "type": "交易账户类型，配送为：COURIER",
    "balance": "余额",
    "amountFrozen": "冻结金额，暂时不用",
    "deposit": "押金",
    "creditLimit": "信用额度，暂时不用",
    "accountNo": "主账户编号：ZH1000006"
}
```

### Ddpay.tradeAccount.add 创建交易账户
#### POST /ddpay/tradeAccount/tradeAccount/add
在此交易账户的主账户下新增另一交易账户
``` javascript
//请求参数
{
	accountNo: "TZH1000039",
	type: "BUSINESSMAN",
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
}
//返回结果
// 同tradeAccount.create 创建交易账户
```

### Ddpay.tradeAccount.find 查询账户信息
#### GET /ddpay/tradeAccount
``` javascript
//请求参数
{
    tradeAccountNo: '绑定的账户号',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
}
//返回结果
//同tradeAccount.create
```
### Ddpay.tradeAccount.setTradePwd 修改支付密码
#### POST /ddpay/tradeAccount/tradePwd
当账户原本没有交易密码时不需要原密码，如果有需要原交易密码。同时需要密码的交易当账户没有设置交易密码时会报“请先设置交易密码再操作！”错误（二期做）
``` javascript
//请求参数
{
	"tradeAccountNo": "绑定的账户号",
	"tradePwd": "原密码，如果没有设置不需要填写",
	"newTradePwd": "新密码",
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
}
//返回结果
//同tradeAccount.create
```


### Ddpay.POST /ddpay/tradeAccount/fix 修复账户信息
由于账户金额等信息存在校验码，当校验失败（ _提示：“账号信息错误，账户被禁用！请通知管理员！_ ”）时需要通过此链接进行修复校验位使账户可以重新访问，目前仅可通过Http访问，未来可能允许RPC，同时此方法不一定会部署在生产环境。
``` javascript
//请求参数
{
    tradeAccountNo: '绑定的账户号',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
}
//返回结果
//同tradeAccount.create
```

### Ddpay.tradeAccount.tradeRecord 查询交易记录
#### GET /ddpay/tradeAccount/tradeRecord 
查询交易记录
``` javascript
//请求参数
{
    tradeAccountNo: '绑定的账户号',
    type: '类型： 1增加 -1减少',
    order: '排序方式，数组 ["id","desc"] GET请求时为其字符串',
    orderType: '请求时传的订单类型',
    limit: '长度，最大为20000',
    offset: '偏移量',
    startTime: '开始时间',
    endTime: '结束时间',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
}
//返回结果
{
	"count": '条数',
	"data": [
	  {
		"tradeRecordNo": '单据号',
		"type": '类型： 1增加 -1减少',
		"tradeType": '账户系统交易类型',
		"amount": '交易金额',
		"field": "变动金额字段： balance或者deposit",
        "fieldStr": "金额字段对应汉语：balance：余额  deposit：押金",
		"orderType": '请求时传的订单类型',
		"orderId": '请求时传的订单ID',
		"outTradeRecordNo": '对应支付系统的支付单号',
		"createdAt": "2017-02-10 15:37:19",
		"updatedAt": "2017-02-10 15:37:19"
	  }
	]
}
```

## ThirdPartAccount 第三方账户，同一账户下第三方账户防重，不同账户允许重复
### Ddpay.bindThirdPartAccount
#### POST /ddpay/tradeAccount/thirdPartAccount/bind 绑定第三方账户
绑定第三方账户，第三方账户类型目前仅为"ALI\_PAY"或"WEI\_CHAT_PAY"
``` javascript
//请求参数
{
	"userName": "第三方用户名",
	"accountNo": "第三方账户编号",
	"tradeAccountNo": "绑定的账户号",
	"accountType": "账户类型 ALI_PAY或WE_CHAT_PAY",
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
}
//返回结果
{
    "id": "账户ID",
    "accountNo": "第三方账户编号",
    "userName": "第三方用户名",
    "accountType": "账户类型"
}
```

### Ddpay.getThirdPartAccounts
#### GET /ddpay/tradeAccount/thirdPartAccount 获取绑定的第三方账户

``` javascript
//请求参数
{
    tradeAccountNo: '绑定的账户号',
    accountType: '账户类型',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
}
//返回结果
//同tradeAccount.bindThirdPartAccount
```

### Ddpay.updateThirdPartAccount
#### POST /ddpay/tradeAccount/thirdPartAccount/update 获取绑定的第三方账户

``` javascript
//请求参数
{
	tradeAccountNo: "TZH1000039",
	thirdPartAccountId: "需要修改的账户ID",
	accountNo: "修改后的账户编号，如未修改传原值",
	accountType: "修改后的账户类型，如未修改，传原值",
	userName: " 修改后真实姓名，如未修改传原值",
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
}
//返回结果
//同tradeAccount.bindThirdPartAccount
```
### Ddpay.unbindThirdPartAccount
#### POST /ddpay/tradeAccount/thirdPartAccount/unbind 获取绑定的第三方账户

``` javascript
//请求参数
{
    tradeAccountNo: '绑定的账户号',
    thirdPartAccountId: '需要解绑的账户ID',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
}
//返回结果
//同tradeAccount.bindThirdPartAccount
```

## trade _交易相关服务_
此部分公用的请求参数为：
``` javascript
//请求参数
{
    system: '对应系统，system+orderType+orderId进行防重',
    tradeAccountNo: '交易账户号，与账户系统唯一关联：TZH1000018',
    amount: '金额',
    orderType: '己方订单类型，建议使用 系统_订单类型',
    orderId: '己方订单Id',
    remark: '备注',
    onceStr:'随机字符串',
    timestamp：'unix时间戳，到秒，所有请求有效期5分钟',
    accountId: '对应需要支付到的账户ID'
}
//部分方法需要的公用额外参数，可能后续用户操作都需要交易密码
```
tradePwd：交易密码，明文
此部分公用返回结果
``` javascript
{
    "tradeRecordNo": "交易流水号",
    "counterpartyNo": "对方支付账户，余额转押金或押金转余额此值等于此交易账户",
    "type": '增加: 1 或减少: -1',
    "tradeType": "交易类型",
    "amount": '交易金额',
    "orderType": "",
    "orderId": ""
}
```


### Ddpay.trade.chargeBalance 余额充值
#### POST /ddpay/trade/balance/charge 
- 请求参数同公用的请求参数
- 无返回结果
- 交易密码：不需要

### Ddpay.trade.balanceToDeposit 余额转押金
#### POST /ddpay/trade/balance/deposit 
- 请求参数同公用的请求参数
- 无返回结果
- 交易密码：需要

### Ddpay.trade.depositToBalance 押金转余额
#### POST /ddpay/trade/deposit/balance 
- 请求参数同公用的请求参数
- 无返回结果
- 交易密码：需要

### Ddpay.trade.withdraw 提现
#### POST /ddpay/trade/withdraw 
``` javascript
//公用的请求参数+额外参数
{
    tradeType: '选择转账渠道，默认ALI_PAY',
    thirdPartAccount: '第三方账户',
    realName: '用户真实姓名',
    tradePwd: '支付密码，非必须'
}
//目前支持的交易类型 tradeType
{
    ALI_PAY: '支付宝'
}
//返回结果
{
    "tradeRecordNo": "转账单号"
}
```
- 交易密码：需要

### Ddpay.trade.chargeDeposit 押金充值
#### POST /ddpay/trade/deposit/charge 
``` javascript
//公用的请求参数+额外参数
{
    tradeType: '选择的支付渠道',
    noCredit: '不能使用信用卡：1禁止，0不禁止，默认为0',
    tradePrincipal: '交易主体，城市ID',
    orderType: '订单类型，押金充值为deposit',
    system: '发起系统'
}
//目前支持的交易类型 tradeType
{
    WE_CHAT_PAY_JSAPI: '微信支付：JSAPI',
    WE_CHAT_PAY_APP: '微信支付：APP',
    WE_CHAT_PAY_NATIVE: '微信支付：NATIVE',


    ALI_PAY_APP: '支付宝支付:APP',
    ALI_PAY_UNION: '支付宝支付：网页'
}
//返回结果
{
    "tradeRecordNo": "支付单号",
    "codeUrl": "支付渠道为WE_CHAT_PAY_NATIVE时或支付支付宝返回：weixin://wxpay/bizpayurl?pr=6svw98v",
    "appParams": "支付渠道为WE_CHAT_PAY_APP时返回此值"
}
```

### Ddpay.trade.payChargeBalance 使用支付宝微信充值余额
#### POST /ddpay/trade/balance/charge/pay 
- orderType为balance
- 参数同trade.chargeDeposit
- 交易密码：不需要

### Ddpay.trade.decreaseBalance 降低余额，目前主要为扣除佣金
#### POST /ddpay/trade/balance/decrease
- 参数同公共参数
- 交易密码：不需要

### Ddpay.trade.selfTransfer 同一主账户下支付账户之间进行转账
#### POST /ddpay/trade/selfTransfer
- 参数同公共参数
``` javascript
//公用的请求参数+额外参数
{
    toTradeAccountNo: '转入账户'
}
```
- 交易密码：需要
- 返回结果同

## statistics _统计服务_

### Ddpay.statistics.byType 根据账户类型进行统计
#### POST /ddpay/statistics/byType
``` javascript
// 请求参数
{
    type: '账户类型：见公共参数账户类型部分，支持数组。',
    tradeAccountNo: '账户编号，支持数组'
}
// 返回结果
// 所有请求类型都包含在内，当不存在此类型时其对应的余额等为0
[
    {
        "type": "类型",
        "balance": '余额',
        "deposit": '押金',
        "count": '存在账户数量'
    },
    {
        "type": "test",
        "balance": 0,
        "deposit": 0,
        "count": 4
    }
]
```

## bill _账单业务_
#### GET /ddpay/bill/download
``` javascript
// 请求参数
{
    date: '账单日期',
    system: '调用接口时的system',
    isBoom: '由于Windows原因，Windows人下查看需要传isBoom=1，自动对账代码不需要传'
}
// 返回结果 csv文件
// 所有请求类型都包含在内，当不存在此类型时其对应的余额等为0
"交易流水号","类型","交易类型","总计金额","实际金额","金额区域","支付账户编号","交易对方支付账户编号","对应单据类型","对应单据的编号","备注","交易网关支付号","发起系统","交易主体"
20170725000013,"转入","chargeDeposit","2.00","2.00","押金","TZH1000722","","deposit","90","押金充值","test_PAYMENT201707251060816","delivery_app","320100"

```

# MQ配置
## 支付结果队列


