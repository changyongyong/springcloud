'use strict'

/**
 * @author WXP
 * @description 支付网关对应的配置
 */

const host = global.ddpayConfig.host;

let configs = {
    'TradeAccount.create': {
        path: '/api/tradeAccount/create',
        outPath: '/tradeAccount/create',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'TradeAccount.add': {
        path: '/api/tradeAccount/add',
        outPath: '/tradeAccount/add',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'TradeAccount.setTradePwd': {
        path: '/api/tradeAccount/tradePwd',
        outPath: '/tradeAccount/tradePwd',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'TradeAccount.find': {
        path: '/api/tradeAccount',
        outPath: '/tradeAccount',
        method: 'GET',
        isSignCheck: true,
        repeatChecK: true
    },
    'TradeAccount.fix': {
        path: '/api/tradeAccount/fix',
        outPath: '/tradeAccount/fix',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'TradeAccount.bindThirdPartAccount': {
        path: '/api/tradeAccount/thirdPartAccount/bind',
        outPath: '/tradeAccount/thirdPartAccount/bind',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'TradeAccount.updateThirdPartAccount': {
        path: '/api/tradeAccount/thirdPartAccount/update',
        outPath: '/tradeAccount/thirdPartAccount/update',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'TradeAccount.unbindThirdPartAccount': {
        path: '/api/tradeAccount/thirdPartAccount/unbind',
        outPath: '/tradeAccount/thirdPartAccount/unbind',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'TradeAccount.getThirdPartAccounts': {
        path: '/api/tradeAccount/thirdPartAccount',
        outPath: '/tradeAccount/thirdPartAccount',
        method: 'GET',
        isSignCheck: true,
        repeatChecK: true
    },
    'TradeAccount.tradeRecord': {
        path: '/api/tradeAccount/tradeRecord',
        outPath: '/tradeAccount/tradeRecord',
        method: 'GET',
        isSignCheck: true
    },
    'Trade.chargeBalance': {
        path: '/api/trade/balance/charge',
        outPath: '/trade/balance/charge',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'Trade.balanceToDeposit': {
        path: '/api/trade/balance/deposit',
        outPath: '/trade/balance/deposit',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'Trade.depositToBalance': {
        path: '/api/trade/deposit/balance',
        outPath: '/trade/deposit/balance',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'Trade.withdraw': {
        path: '/api/trade/withdraw',
        outPath: '/trade/withdraw',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'Trade.cancelWithdraw': {
        path: '/api/trade/cancelWithdraw',
        outPath: '/trade/cancelWithdraw',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'Trade.repeatWithdraw': {
        path: '/api/trade/repeatWithdraw',
        outPath: '/trade/repeatWithdraw',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'Trade.chargeDeposit': {
        path: '/api/trade/deposit/charge',
        outPath: '/trade/deposit/charge',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'Trade.payChargeBalance': {
        path: '/api/trade/balance/charge/pay',
        outPath: '/trade/balance/charge/pay',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'Trade.decreaseBalance': {
        path: '/api/trade/balance/decrease',
        outPath: '/trade/balance/decrease',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'Trade.selfTransfer': {
        path: '/api/trade/selfTransfer',
        outPath: '/trade/selfTransfer',
        method: 'POST',
        isSignCheck: true,
        repeatChecK: true
    },
    'Statistics.byType': {
        path: '/api/statistics/byType',
        outPath: '/statistics/byType',
        method: 'POST',
        isSignCheck: true
    },
    'Bill.bill': {
        path: '/api/bill/download',
        outPath: '/bill/download',
        method: 'GET',
        proxy: true,
        isRPC: false
    }
};

/* eslint-disable  */
for (let key in configs) {
    configs[key].host = host;
}

module.exports = configs;