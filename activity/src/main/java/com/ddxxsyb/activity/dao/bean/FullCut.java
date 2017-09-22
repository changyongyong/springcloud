package com.ddxxsyb.activity.dao.bean;

import java.io.Serializable;
import java.math.BigDecimal;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

@ApiModel(value = "满减优惠实体")
public class FullCut implements Serializable, Comparable<FullCut> {

	private static final long serialVersionUID = 5277446573234280214L;

	/**
	 * 满足金额
	 */
	@ApiModelProperty(value = "满足金额", required = true)
	private BigDecimal full;

	/**
	 * 优惠金额
	 */
	@ApiModelProperty(value = "优惠金额", required = true)
	private BigDecimal cut;

	public BigDecimal getFull() {
		return full;
	}

	public void setFull(BigDecimal full) {
		this.full = full;
	}

	public BigDecimal getCut() {
		return cut;
	}

	public void setCut(BigDecimal cut) {
		this.cut = cut;
	}

	@Override
	public int compareTo(FullCut o) {
		if (o == null || o.getFull() == null) {
			return -1;
		}
		return this.full.compareTo(o.getFull());
	}

}
