package com.ddxxsyb.stock.dao.view;

import java.io.Serializable;
import java.math.BigInteger;

public class GoodsHistory implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/*
	 * 变动后数量
	 */
	private Integer amount;

	/*
	 * 条码
	 */
	private BigInteger barcode;

	/*
	 * 进价
	 */
	private Double bid;

	/*
	 * 分类编号
	 */
	private String cid;

	/*
	 * 变动类型
	 */
	private Integer changeType;

	/*
	 * 变动类型
	 */
	private String dir;

	/*
	 * 线上售价
	 */
	private Double money;

	/*
	 * 商品名称
	 */
	private String name;

	/*
	 * 变动数量
	 */
	private Integer quantity;

	/*
	 * 时间戳
	 */
	private Long timestamp;

	/*
	 * 订单id
	 */
	private String orderid;

	/*
	 * 是否有单据号没有传false
	 */
	private String oid;

	public Integer getAmount() {
		return amount;
	}

	public void setAmount(Integer amount) {
		this.amount = amount;
	}

	public BigInteger getBarcode() {
		return barcode;
	}

	public void setBarcode(BigInteger barcode) {
		this.barcode = barcode;
	}

	public Double getBid() {
		return bid;
	}

	public void setBid(Double bid) {
		this.bid = bid;
	}

	public String getCid() {
		return cid;
	}

	public void setCid(String cid) {
		this.cid = cid;
	}

	public String getDir() {
		return dir;
	}

	public void setDir(String dir) {
		this.dir = dir;
	}

	public Double getMoney() {
		return money;
	}

	public void setMoney(Double money) {
		this.money = money;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public Long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Long timestamp) {
		this.timestamp = timestamp;
	}

	public String getOrderid() {
		return orderid;
	}

	public void setOrderid(String orderid) {
		this.orderid = orderid;
	}

	public String getOid() {
		return oid;
	}

	public void setOid(String oid) {
		this.oid = oid;
	}

	public Integer getChangeType() {
		return changeType;
	}

	public void setChangeType(Integer changeType) {
		this.changeType = changeType;
	}

}
