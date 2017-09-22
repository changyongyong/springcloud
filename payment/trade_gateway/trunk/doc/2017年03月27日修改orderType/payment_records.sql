UPDATE payment_records
SET orderType = 'DD_PAY|deposit'
WHERE
	orderType = '店达-充值押金';

UPDATE payment_records
SET orderType = 'order'
WHERE
	orderType = '店达商城-订单';