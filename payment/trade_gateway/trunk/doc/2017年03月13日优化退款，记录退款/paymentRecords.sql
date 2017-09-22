ALTER TABLE payment_records ADD COLUMN refundTimes INT DEFAULT 0 COMMENT '退款次数', ADD COLUMN refundableFee DECIMAL(15, 2) COMMENT '剩余可退款金额';
update payment_records set refundTimes = 0, refundableFee = totalFee;
UPDATE payment_records,
 (
	SELECT
		count(id) AS times,
		sum(totalFee) AS totalFee,
		paymentRecordNo
	FROM
		refund_records
	WHERE
		`status` = 'success'
	GROUP BY
		paymentRecordNo
) AS t
SET payment_records.refundableFee = payment_records.refundableFee - t.totalFee,
 payment_records.refundTimes = t.times
WHERE
	payment_records.tradeRecordNo = t.paymentRecordNo;