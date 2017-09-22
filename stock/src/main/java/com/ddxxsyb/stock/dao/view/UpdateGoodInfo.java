package com.ddxxsyb.stock.dao.view;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

public class UpdateGoodInfo implements Serializable {

	private static final long serialVersionUID = -8684783097096814004L;

	private Integer bspId;// 库存id

	private Integer storeId; // 店铺编号

	private String name; // 商品名称

	private BigDecimal price; // 下单时的价格

	private Integer amount; // 下单时的数量

	private Long goodId; // 商品Id

	private String oid;// 订单orderId

	private Integer stock;

	private String cid;

	private String barcode;

	private BigDecimal cost;

	private Date createAt;// 创建时间

	private Integer historyAmount;// 历史销量

	public Integer getBspId() {
		return bspId;
	}

	public void setBspId(Integer bspId) {
		this.bspId = bspId;
	}

	public Integer getStoreId() {
		return storeId;
	}

	public void setStoreId(Integer storeId) {
		this.storeId = storeId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public Integer getAmount() {
		return amount;
	}

	public void setAmount(Integer amount) {
		this.amount = amount;
	}

	public Long getGoodId() {
		return goodId;
	}

	public void setGoodId(Long goodId) {
		this.goodId = goodId;
	}

	public String getOid() {
		return oid;
	}

	public void setOid(String oid) {
		this.oid = oid;
	}


	public String getCid() {
		return cid;
	}

	public void setCid(String cid) {
		this.cid = cid;
	}

	public String getBarcode() {
		return barcode;
	}

	public void setBarcode(String barcode) {
		this.barcode = barcode;
	}

	public Date getCreateAt() {
		return createAt;
	}

	public void setCreateAt(Date createAt) {
		this.createAt = createAt;
	}

	public Integer getHistoryAmount() {
		return historyAmount;
	}

	public void setHistoryAmount(Integer historyAmount) {
		this.historyAmount = historyAmount;
	}

	public Integer getStock() {
		return stock;
	}

	public void setStock(Integer stock) {
		this.stock = stock;
	}

	public BigDecimal getCost() {
		return cost;
	}

	public void setCost(BigDecimal cost) {
		this.cost = cost;
	}
}
