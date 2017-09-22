package com.ddxxsyb.activity.dao.bean;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

@ApiModel(value="活动添加修改请求实体")
public class EditStoreActivity implements Serializable {

	private static final long serialVersionUID = -3991589423637337584L;

	/**
	 * 活动id
	 */
	@JsonProperty("activity_id")
	@ApiModelProperty(value = "活动id", required = false)
	private Integer activityId;

	/**
	 * 类型
	 */
	@ApiModelProperty(value = "活动类型", required = true)
	private String type;

	/**
	 * 名称
	 */
	@ApiModelProperty(value = "活动名称", required = true)
	private String name;

	/**
	 * 开始时间
	 */
	@JsonProperty("start_time")
	@ApiModelProperty(value = "开始时间", required = true)
	private String startTime;

	/**
	 * 结束时间
	 */
	@JsonProperty("end_time")
	@ApiModelProperty(value = "结束时间", required = true)
	private String endTime;

	@JsonProperty("full_cut")
	@ApiModelProperty(value = "满减优惠", required = true)
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

	public String getStartTime() {
		return startTime;
	}

	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}

	public String getEndTime() {
		return endTime;
	}

	public void setEndTime(String endTime) {
		this.endTime = endTime;
	}

	public FullCut[] getFullCuts() {
		return fullCuts;
	}

	public void setFullCuts(FullCut[] fullCuts) {
		this.fullCuts = fullCuts;
	}

}
