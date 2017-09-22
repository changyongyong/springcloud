package com.ddxxsyb.stock.dao.view;

import java.io.Serializable;

public class GoodsSales implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/*
	 * 分类编号
	 */
	private String cid;

	/*
	 * 毛利
	 */
	private Double gp;

	/*
	 * 毛利率
	 */
	private Double gpp;

	/*
	 * 销售金额
	 */
	private Double money;

	/*
	 * 商品名称
	 */
	private String name;

	/*
	 * 销售金额占比
	 */
	private Double per;

	/*
	 * 销售数量
	 */
	private Integer quantity;

	public String getCid() {
		return cid;
	}

	public void setCid(String cid) {
		this.cid = cid;
	}

	public Double getGp() {
		return gp;
	}

	public void setGp(Double gp) {
		this.gp = gp;
	}

	public Double getGpp() {
		return gpp;
	}

	public void setGpp(Double gpp) {
		this.gpp = gpp;
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

	public Double getPer() {
		return per;
	}

	public void setPer(Double per) {
		this.per = per;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

}
