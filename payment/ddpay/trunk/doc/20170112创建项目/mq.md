1. 增加queue dd_pay_trade_result
2. 将queue绑定到exchange
    - tradeGateway.paymentResult 路由 DD_PAY
    - tradeGateway.refundResult 路由 DD_PAY
    - tradeGateway.transferResult 路由 DD_PAY