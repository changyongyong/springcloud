package com.ddxxsyb.activity.dao.pojo;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * 
 *<li>模块名 : StoreActivityTB<br />
 *<li>文件名 : StoreActivityTB.java<br />
 *<li>创建时间 : 2017年5月26日<br />
 *<li>实现功能 : 店铺活动
 *<li><br />作者 : shenyf
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年5月26日 v0.0.1 shenyf 创建<br />
 */
@Entity
@Table(name = "store_activity")
public class StoreActivityTB implements Serializable {

	private static final long serialVersionUID = -656838322818440465L;

	// 活动状态--未开始
	public static final String STATUS_READY = "PROMOTION_READY";

	// 活动状态--进行中
	public static final String STATUS_ON = "PROMOTION_ON";

	// 活动状态--暂停
	public static final String STATUS_PAUSE = "PROMOTION_PAUSE";

	// 活动状态--结束
	public static final String STATUS_OFF = "PROMOTION_OFF";

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "sa_id")
	private Integer id;

	/**
	 * 店铺id
	 */
	@Column(name = "store_id")
	private Integer storeId;

	/**
	 * 类型
	 */
	@Column(name = "sa_type")
	private String type;

	/**
	 * 名称
	 */
	@Column(name = "sa_name")
	private String name;

	/**
	 * 开始时间
	 */
	@Column(name = "sa_start_time")
	private Date startTime;

	/**
	 * 结束时间
	 */
	@Column(name = "sa_end_time")
	private Date endTime;

	/**
	 * 创建时间
	 */
	@Column(name = "sa_create_time")
	private Date createTime;

	/**
	 * 活动状态
	 */
	@Column(name = "sa_status")
	private String status;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getStoreId() {
		return storeId;
	}

	public void setStoreId(Integer storeId) {
		this.storeId = storeId;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getStartTime() {
		return startTime;
	}

	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}

	public Date getEndTime() {
		return endTime;
	}

	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}

	public Date getCreateTime() {
		return createTime;
	}

	public void setCreateTime(Date createTime) {
		this.createTime = createTime;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

}
