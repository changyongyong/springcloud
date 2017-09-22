package com.ddxxsyb.activity.dao.bean;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.fasterxml.jackson.annotation.JsonProperty;

public class StoreActivityBean implements Serializable {

	private static final long serialVersionUID = -5979627204118905691L;

	/**
	 * 活动id
	 */
	@JsonProperty("activity_id")
	private Integer activityId;

	/**
	 * 类型
	 */
	private String type;

	/**
	 * 名称
	 */
	private String name;

	/**
	 * 开始时间
	 */
	@JsonProperty("start_time")
	private Date startTime;

	/**
	 * 结束时间
	 */
	@JsonProperty("end_time")
	private Date endTime;

	/**
	 * 创建时间
	 */
	@JsonProperty("create_time")
	private Date createTime;

	/**
	 * 活动状态
	 */
	private String status;

	/**
	 * 活动状态描述
	 */
	@JsonProperty("status_info")
	private String statusInfo;

	@JsonProperty("full_cut")
	private FullCut[] fullCuts;

	public Integer getActivityId() {
		return activityId;
	}

	public void setActivityId(Integer activityId) {
		this.activityId = activityId;
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

	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd", timezone = "GMT+8")
	public Date getStartTime() {
		return startTime;
	}

	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}

	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd", timezone = "GMT+8")
	public Date getEndTime() {
		return endTime;
	}

	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}

	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
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

	public String getStatusInfo() {
		return statusInfo;
	}

	public void setStatusInfo(String statusInfo) {
		this.statusInfo = statusInfo;
	}

	public FullCut[] getFullCuts() {
		return fullCuts;
	}

	public void setFullCuts(FullCut[] fullCuts) {
		this.fullCuts = fullCuts;
	}

}
