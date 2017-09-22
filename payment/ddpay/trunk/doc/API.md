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

### tradeAccount.create 创建交易账户
#### POST /api/tradeAccount/create
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

### tradeAccount.add 创建交易账户
#### POST /api/tradeAccount/add
在此交易账户的主账户下新增另一交易账户
``` javascript
//请求参数
{
	accountNo: "TZH1000039",
	type: "BUSINESSMAN"
}
//返回结果
// 同tradeAccount.create 创建交易账户
```

### tradeAccount.find 查询账户信息
#### GET /api/tradeAccount
``` javascript
//请求参数
{
    tradeAccountNo: '绑定的账户号'
}
//返回结果
//同tradeAccount.create
```
### tradeAccount.setTradePwd 修改支付密码
#### POST /api/tradeAccount/tradePwd
当账户原本没有交易密码时不需要原密码，如果有需要原交易密码。同时需要密码的交易当账户没有设置交易密码时会报“请先设置交易密码再操作！”错误（二期做）
``` javascript
//请求参数
{
	"tradeAccountNo": "绑定的账户号",
	"tradePwd": "原密码，如果没有设置不需要填写",
	"newTradePwd": "新密码"
}
//返回结果
//同tradeAccount.create
```


### POST /api/tradeAccount/fix 修复账户信息
由于账户金额等信息存在校验码，当校验失败（ _提示：“账号信息错误，账户被禁用！请通知管理员！_ ”）时需要通过此链接进行修复校验位使账户可以重新访问，目前仅可通过Http访问，未来可能允许RPC，同时此方法不一定会部署在生产环境。
``` javascript
//请求参数
{
    tradeAccountNo: '绑定的账户号'
}
//返回结果
//同tradeAccount.create
```

### tradeAccount.tradeRecord 查询交易记录
#### GET /api/tradeAccount/tradeRecord 
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
    endTime: '结束时间'
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
### bindThirdPartAccount
#### POST /api/tradeAccount/thirdPartAccount/bind 绑定第三方账户
绑定第三方账户，第三方账户类型目前仅为"ALI\_PAY"或"WEI\_CHAT_PAY"
``` javascript
//请求参数
{
	"userName": "第三方用户名",
	"accountNo": "第三方账户编号",
	"tradeAccountNo": "绑定的账户号",
	"accountType": "账户类型 ALI_PAY或WE_CHAT_PAY"
}
//返回结果
{
    "id": "账户ID",
    "accountNo": "第三方账户编号",
    "userName": "第三方用户名",
    "accountType": "账户类型"
}
```

### getThirdPartAccounts
#### GET /api/tradeAccount/thirdPartAccount 获取绑定的第三方账户

``` javascript
//请求参数
{
    tradeAccountNo: '绑定的账户号',
    accountType: '账户类型'
}
//返回结果
//同tradeAccount.bindThirdPartAccount
```

### updateThirdPartAccount
#### POST /api/tradeAccount/thirdPartAccount/update 获取绑定的第三方账户

``` javascript
//请求参数
{
	tradeAccountNo: "TZH1000039",
	thirdPartAccountId: "需要修改的账户ID",
	accountNo: "修改后的账户编号，如未修改传原值",
	accountType: "修改后的账户类型，如未修改，传原值",
	userName: " 修改后真实姓名，如未修改传原值"
}
//返回结果
//同tradeAccount.bindThirdPartAccount
```
### unbindThirdPartAccount
#### POST /api/tradeAccount/thirdPartAccount/unbind 获取绑定的第三方账户

``` javascript
//请求参数
{
    tradeAccountNo: '绑定的账户号',
    thirdPartAccountId: '需要解绑的账户ID'
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
    remark: '备注'
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


### trade.chargeBalance 余额充值
#### POST /api/trade/balance/charge 
- 请求参数同公用的请求参数
- 无返回结果
- 交易密码：不需要

### trade.balanceToDeposit 余额转押金
#### POST /api/trade/balance/deposit 
- 请求参数同公用的请求参数
- 无返回结果
- 交易密码：需要

### trade.depositToBalance 押金转余额
#### POST /api/trade/deposit/balance 
- 请求参数同公用的请求参数
- 无返回结果
- 交易密码：需要

### trade.withdraw 提现
#### POST /api/trade/withdraw 
``` javascript
//公用的请求参数+额外参数
{
    tradeType: '选择转账渠道，默认ALI_PAY',
    source: '支付来源，与其它相同',
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


### trade.repeatWithdraw 重试
#### POST /api/trade/repeatWithdraw
``` javascript
{
    transferRecordNo： 单据号,
    remark: 备注,
    accountId: 账户id
}
//返回结果
{
    //  不是用户信息错误的时候返回数据
    "tag": "success",
    "status": 1,
    "data": {
        "code": "PAYER_BALANCE_NOT_ENOUGH",
        "tradeRecordNo": "dev_TRANSFER201707271050227",
        "withdrawApplyNo": "ddpay_transfer_105"
    }
    //  错误的时候返回的数据
    "tag": "error",
    "status": -99,
    "message": 'xxx错误'

    //  成功的时候，用户钱也到账的时候
    {
        "tag": "success",
        "status": 1,
        "data": {
            "tradeRecordNo": "dev_TRANSFER201707271050228",
            "type": -1,
            "tradeType": "withdrawCash",
            "amount": 0,
            "field": "balance",
            "orderType": "WITHDRAW_CASH",
            "system": "b_order",
            "tradePrincipal": "000000",
            "withdrawApplyNo": "ddpay_transfer_110",
            "code": null
        }
    }
}
```


### trade.cancelWithdraw 撤销
#### POST /api/trade/cancelWithdraw
``` javascript
{
    transferRecordNo： 单据号,
    remark: 备注,
    accountId: 账户id
}
//返回结果
{
    //  成功
    "tag": "success",
    "status": 1

     //  失败
        "tag": "error",
        "status": -99,
        "error": "错误信息"
}
```

### trade.chargeDeposit 押金充值
#### POST /api/trade/deposit/charge 
``` javascript
//公用的请求参数+额外参数
{
    tradeType: '选择的支付渠道',
    source: '支付来源，仅tradeType为微信支付时需要：psapp,dd528,ddapp，其中psapp为配送APP,dd528为店达商城网站,ddapp为店达商城APP',
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

### trade.payChargeBalance 使用支付宝微信充值余额
#### POST /api/trade/balance/charge/pay 
- orderType为balance
- 参数同trade.chargeDeposit
- 交易密码：不需要

### trade.decreaseBalance 降低余额，目前主要为扣除佣金
#### POST /api/trade/balance/decrease
- 参数同公共参数
- 交易密码：不需要

### trade.selfTransfer 同一主账户下支付账户之间进行转账
#### POST /api/trade/selfTransfer
- 参数同公共参数
``` javascript
//公用的请求参数+额外参数
{
    toTradeAccountNo: '转入账户'
}
```
- 交易密码：需要
- 返回结果同

# MQ配置
## 支付结果队列

## statistics _统计服务_

### statistics.byType 根据账户类型进行统计
#### GET/POST /api/statistics/byType
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


