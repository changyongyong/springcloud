package com.ddxxsyb.activity.dao.bean;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BatchStoreActivityBean implements Serializable {

	private static final long serialVersionUID = -4699535905891331560L;

	@JsonProperty("activities")
	private List<StoreActivityBean> storeActivityBeans;

	@JsonProperty("store_id")
	private Integer storeId;

	public List<StoreActivityBean> getStoreActivityBeans() {
		return storeActivityBeans;
	}

	public void setStoreActivityBeans(List<StoreActivityBean> storeActivityBeans) {
		this.storeActivityBeans = storeActivityBeans;
	}

	public Integer getStoreId() {
		return storeId;
	}

	public void setStoreId(Integer storeId) {
		this.storeId = storeId;
	}

}
