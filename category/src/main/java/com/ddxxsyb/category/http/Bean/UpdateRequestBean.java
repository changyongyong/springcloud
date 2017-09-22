package com.ddxxsyb.category.http.Bean;

import java.io.Serializable;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * 
 *<li>模块名 : AddRequestBean<br />
 *<li>文件名 : AddRequestBean.java<br />
 *<li>创建时间 : 2017年8月23日<br />
 *<li>实现功能 : 更新目录信息请求封装类
 *<li><br />作者 : yuxy
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年8月23日 v0.0.1 yuxy 创建<br />
 */
@ApiModel(value="更新目录信息请求封装类" ,description=" ")
public class UpdateRequestBean implements Serializable {

	private static final long serialVersionUID = 1L;
	
	@ApiModelProperty(name="storeId",value="店铺id",required=true,dataType="Integer")
	private Integer storeId;  //店铺id
	
	@ApiModelProperty(name="catelogId",value="分类id",required=true,dataType="String")
	private String  catelogId; //分类id
	
	@ApiModelProperty(name="pkSum",value="打包费",notes="选填",required=false,dataType="Double")
	private Double pkSum;   //打包费
	
	@ApiModelProperty(name="name",value="分类名称",notes="选填",required=false,dataType="String")
	private String name;   //分类名称
	
	@ApiModelProperty(name="sort",value="排序号",notes="选填",required=false,dataType="Integer")
	private Integer sort;  //排序号
	
	
	
	
	
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




	public String getCatelogId() {
		return catelogId;
	}



	public void setCatelogId(String catelogId) {
		this.catelogId = catelogId;
	}



	public Integer getStoreId() {
		return storeId;
	}



	public void setStoreId(Integer storeId) {
		this.storeId = storeId;
	}



	@Override
	public String toString() {
		return "RequestBean [storeId=" + storeId + ", catelogId=" + catelogId + ", pkSum=" + pkSum + ", name=" + name + ", sort=" + sort + "]";
	}



	

	
	
	
}
