package com.ddxxsyb.category.http.Bean;

import java.io.Serializable;

import org.apache.commons.lang3.StringUtils;

import com.ddxxsyb.category.dao.pojo.BStoreProductCatalog;

public class ResponseBean implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private Integer storeId;  //店铺id
	private String  catelogId; //分类id
	
	private Double pkSum;   //打包费
	
	private String name;   //分类名称
	
	private Integer sort;  //排序号
	
	
	
	

	public ResponseBean() {
		super();
	}
	
	
	
	public ResponseBean(BStoreProductCatalog entity) {
		this.catelogId=StringUtils.isBlank(entity.getBspcCatalogId()) ? "":entity.getBspcCatalogId();
		this.pkSum=(null ==entity.getBspcPackage())? 0 :entity.getBspcPackage().doubleValue();
		this.name=StringUtils.isBlank(entity.getBspcCatalogName()) ? "":entity.getBspcCatalogName();
		this.storeId=entity.getBspcStoreId();
		this.sort=entity.getBspcSequence();
	}

	



	public Integer getStoreId() {
		return storeId;
	}





	public void setStoreId(Integer storeId) {
		this.storeId = storeId;
	}





	public String getCatelogId() {
		return catelogId;
	}





	public void setCatelogId(String catelogId) {
		this.catelogId = catelogId;
	}





	public Double getPkSum() {
		return pkSum;
	}





	public void setPkSum(Double pkSum) {
		this.pkSum = pkSum;
	}





	public String getName() {
		return name;
	}





	public void setName(String name) {
		this.name = name;
	}





	public Integer getSort() {
		return sort;
	}





	public void setSort(Integer sort) {
		this.sort = sort;
	}





	@Override
	public String toString() {
		return "ResponseBean [storeId=" + storeId + ", catelogId=" + catelogId + ", pkSum=" + pkSum
				+ ", name=" + name + ", sort=" + sort + "]";
	}
	
	
	
}
