package com.ddxxsyb.article.dao.bean;

import java.io.Serializable;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

@ApiModel(value="广告分页查询条件请求")
public class AttachedScreenSearchBean implements Serializable {

	private static final long serialVersionUID = -7980197405577895485L;

	/**
	 * 状态：-1全部；0:未开始；1：发布中；2：已暂停；3：已结束；99：逻辑删除
	 */
	@ApiModelProperty(value = "广告状态", required = false,notes="状态：-1全部；0:未开始；1：发布中；2：已暂停；3：已结束；99：逻辑删除")
	private Integer status;

	@ApiModelProperty(value = "城市Id", required = false)
	private Integer cityId;

	@ApiModelProperty(value = "拥有城市Id字符串", required = false)
	private String hasCityIds;

	@ApiModelProperty(value = "页码", required = true)
	private Integer pageIndex;

	@ApiModelProperty(value = "每页条数", required = true)
	private Integer pageSize;

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

	public Integer getPageIndex() {
		return pageIndex;
	}

	public void setPageIndex(Integer pageIndex) {
		this.pageIndex = pageIndex;
	}

	public Integer getPageSize() {
		return pageSize;
	}

	public void setPageSize(Integer pageSize) {
		this.pageSize = pageSize;
	}

	public Integer getCityId() {
		return cityId;
	}

	public void setCityId(Integer cityId) {
		this.cityId = cityId;
	}

	public String getHasCityIds() {
		return hasCityIds;
	}

	public void setHasCityIds(String hasCityIds) {
		this.hasCityIds = hasCityIds;
	}

}
