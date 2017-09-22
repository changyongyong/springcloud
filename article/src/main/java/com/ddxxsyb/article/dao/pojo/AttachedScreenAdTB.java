package com.ddxxsyb.article.dao.pojo;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.shengyibao.common.DateUtils;

/**
 * 
 *<li>模块名 : AttachedScreenAdTB<br />
 *<li>文件名 : AttachedScreenAdTB.java<br />
 *<li>创建时间 : 2017年6月20日<br />
 *<li>实现功能 : 
 *<li><br />作者 : shenyf
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年6月20日 v0.0.1 shenyf 创建<br />
 */
@Entity
@Table(name = "attached_screen_ad")
public class AttachedScreenAdTB implements Serializable {

	private static final long serialVersionUID = -2328055498557046654L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "asa_id")
	private Integer id;

	/**
	 * 标题
	 */
	@Column(name = "asa_title")
	private String title;

	/**
	 * 类型
	 */
	@Column(name = "asa_type")
	private Integer type;

	/**
	 * 内容
	 */
	@Column(name = "asa_content")
	private String content;

	/**
	 * 是否全部城市；0-全部；1-部分
	 */
	@Column(name = "asa_all_city")
	private Integer allCity;

	/**
	 * 城市ids
	 */
	@Column(name = "asa_city_ids")
	private String cityIds;

	/**
	 * 城市ids
	 */
	@Column(name = "asa_city_names")
	private String cityNames;

	/**
	 * 开始时间
	 */
	@Column(name = "asa_start_date")
	private Date startDate;

	/**
	 * 结束时间
	 */
	@Column(name = "asa_end_date")
	private Date endDate;

	/**
	 * 图片1
	 */
	@Column(name = "asa_image_one")
	private String image1;

	/**
	 * 图片2
	 */
	@Column(name = "asa_image_two")
	private String image2;

	/**
	 * 0：发布中;1:未开始；2：已暂停；3：已结束；99：逻辑删除
	 */
	@Column(name = "asa_status")
	private Integer status;

	@Column(name = "asa_create_time")
	private Date createTime;

	@Column(name = "asa_update_time")
	private Date updateTime;

	@Column(name = "asa_sort")
	private Integer sort;

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

	@JsonFormat(shape = Shape.STRING, timezone = "GMT+8", pattern = DateUtils.DATE_FORMAT_DATEONLY)
	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	@JsonFormat(shape = Shape.STRING, timezone = "GMT+8", pattern = DateUtils.DATE_FORMAT_DATEONLY)
	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	public Date getCreateTime() {
		return createTime;
	}

	public void setCreateTime(Date createTime) {
		this.createTime = createTime;
	}

	public String getCityNames() {
		return cityNames;
	}

	public void setCityNames(String cityNames) {
		this.cityNames = cityNames;
	}

	public Date getUpdateTime() {
		return updateTime;
	}

	public void setUpdateTime(Date updateTime) {
		this.updateTime = updateTime;
	}

}
