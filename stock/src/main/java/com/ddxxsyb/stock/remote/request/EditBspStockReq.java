package com.ddxxsyb.stock.remote.request;

import java.io.Serializable;

public class EditBspStockReq implements Serializable{

	private static final long serialVersionUID = 2564903608386253671L;
	
	/**
	 * 店铺商品id
	 */
	private Integer bspId;
	
	/**
	 * 库存变化量
	 */
	private Integer amount;

	public Integer getBspId() {
		return bspId;
	}

	public void setBspId(Integer bspId) {
		this.bspId = bspId;
	}

	public Integer getAmount() {
		return amount;
	}

	public void setAmount(Integer amount) {
		this.amount = amount;
	}
	
}
