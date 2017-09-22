package com.ddxxsyb.article.dao.bean;

import java.io.Serializable;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

@ApiModel(value = "副屏广告修改请求实体")
public class ModifyAttachedScreenBean implements Serializable {

	private static final long serialVersionUID = -1494507374162849554L;

	@ApiModelProperty(value = "广告id")
	private Integer id;

	/**
	 * 标题
	 */
	@ApiModelProperty(value = "标题")
	private String title;

	/**
	 * 类型
	 */
	@ApiModelProperty(value = "类型")
	private Integer type;

	/**
	 * 内容
	 */
	@ApiModelProperty(value = "内容")
	private String content;

	/**
	 * 是否全部城市；0-全部；1-部分
	 */
	@ApiModelProperty(value = "是否全部城市；0-全部；1-部分")
	private Integer allCity = 1;

	/**
	 * 城市ids
	 */
	@ApiModelProperty(value = "城市ids字符串")
	private String cityIds;

	/**
	 * 开始时间
	 */
	@ApiModelProperty(value = "开始时间")
	private String startDate;

	/**
	 * 结束时间
	 */
	@ApiModelProperty(value = "结束时间")
	private String endDate;

	/**
	 * 图片1
	 */
	@ApiModelProperty(value = "图片1")
	private String image1;

	/**
	 * 图片2
	 */
	@ApiModelProperty(value = "图片2")
	private String image2;

	/**
	 * 排序
	 */
	@ApiModelProperty(value = "排序")
	private Integer sort = 0;

	/**
	 * 状态
	 */
	@ApiModelProperty(value = "状态")
	private Integer status = 1;

	public ModifyAttachedScreenBean() {
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Integer getType() {
		return type;
	}

	public void setType(Integer type) {
		this.type = type;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public Integer getAllCity() {
		return allCity;
	}

	public void setAllCity(Integer allCity) {
		this.allCity = allCity;
	}

	public String getCityIds() {
		return cityIds;
	}

	public void setCityIds(String cityIds) {
		this.cityIds = cityIds;
	}

	public String getStartDate() {
		return startDate;
	}

	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}

	public String getEndDate() {
		return endDate;
	}

	public void setEndDate(String endDate) {
		this.endDate = endDate;
	}

	public String getImage1() {
		return image1;
	}

	public void setImage1(String image1) {
		this.image1 = image1;
	}

	public String getImage2() {
		return image2;
	}

	public void setImage2(String image2) {
		this.image2 = image2;
	}

	public Integer getSort() {
		return sort;
	}

	public void setSort(Integer sort) {
		this.sort = sort;
	}

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

}
