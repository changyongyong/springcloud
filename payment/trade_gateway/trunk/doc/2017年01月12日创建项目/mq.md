1. 在外部消息服务器增加type为direct的exchange：
    - tradeGateway.paymentResult
    - tradeGateway.refundResult
    - tradeGateway.transferResult
2. 在内部消息服务器增加queue
    - trade_gateway_payment_result
    - trade_gateway_refund_result
    - trade_gateway_transfer_result