package com.ddxxsyb.article.dao.bean;

import java.io.Serializable;
import java.util.Date;

import com.ddxxsyb.article.dao.pojo.AttachedScreenAdTB;
import com.ddxxsyb.article.dao.pojo.ScreenAdSortTB;

public class ScreenAdView implements Serializable {

	private static final long serialVersionUID = 7576551388161733169L;

	/**
	 * 主表广告id
	 */
	private Integer id;

	/**
	 * 排序表id
	 */
	private Integer sortId;

	/**
	 * 标题
	 */
	private String title;

	/**
	 * 类型
	 */
	private Integer type;

	/**
	 * 内容
	 */
	private String content;

	/**
	 * 是否全部城市；0-全部；1-部分
	 */
	private Integer allCity;

	/**
	 * 城市ids
	 */
	private String cityIds;

	/**
	 * 城市names
	 */
	private String cityNames;

	/**
	 * 开始时间
	 */
	private Date startDate;

	/**
	 * 结束时间
	 */
	private Date endDate;

	/**
	 * 图片1
	 */
	private String image1;

	/**
	 * 图片2
	 */
	private String image2;

	/**
	 * 0：发布中;1:未开始；2：已暂停；3：已结束；99：逻辑删除
	 */
	private Integer status;

	/**
	 * 创建时间
	 */
	private Date createTime;

	/**
	 * 更新时间
	 */
	private Date updateTime;

	/**
	 * 排序表sort
	 */
	private Integer sort;

	public ScreenAdView() {
	}

	public ScreenAdView(ScreenAdSortTB sortTB, AttachedScreenAdTB adTB) {
		this.id = adTB.getId();
		this.sortId = sortTB.getId();
		this.title = adTB.getTitle();
		this.type = adTB.getType();
		this.content = adTB.getContent();
		this.allCity = adTB.getAllCity();
		this.cityIds = adTB.getCityIds();
		// this.cityNames = adTB.getCityNames();
		this.cityNames = sortTB.getCityName();// 单个城市只显示这个城市民称
		this.startDate = adTB.getStartDate();
		this.endDate = adTB.getEndDate();
		this.image1 = adTB.getImage1();
		this.image2 = adTB.getImage2();
		this.status = adTB.getStatus();
		this.sort = sortTB.getSort();
		this.createTime = adTB.getCreateTime();
		this.updateTime = adTB.getUpdateTime();
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

	public String getCityNames() {
		return cityNames;
	}

	public void setCityNames(String cityNames) {
		this.cityNames = cityNames;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
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

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

	public Integer getSort() {
		return sort;
	}

	public void setSort(Integer sort) {
		this.sort = sort;
	}

	public Integer getSortId() {
		return sortId;
	}

	public void setSortId(Integer sortId) {
		this.sortId = sortId;
	}

	public Date getCreateTime() {
		return createTime;
	}

	public void setCreateTime(Date createTime) {
		this.createTime = createTime;
	}

	public Date getUpdateTime() {
		return updateTime;
	}

	public void setUpdateTime(Date updateTime) {
		this.updateTime = updateTime;
	}

}
