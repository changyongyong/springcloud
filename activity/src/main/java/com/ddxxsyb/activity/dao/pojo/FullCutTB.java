package com.ddxxsyb.activity.dao.pojo;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * 
 *<li>模块名 : FullCutTB<br />
 *<li>文件名 : FullCutTB.java<br />
 *<li>创建时间 : 2017年5月26日<br />
 *<li>实现功能 : 满减活动优惠
 *<li><br />作者 : shenyf
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年5月26日 v0.0.1 shenyf 创建<br />
 */
@Entity
@Table(name = "store_activity_full_cut")
public class FullCutTB implements Serializable {

	private static final long serialVersionUID = 2665128063783961463L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "safc_id")
	private Integer id;

	/**
	 * 店铺活动id
	 */
	@Column(name = "sa_id")
	private Integer storeActivityId;

	/**
	 * 满减优惠一
	 */
	@Column(name = "safc_full_cut_one")
	private String fullCutOne;

	/**
	 * 满减优惠二
	 */
	@Column(name = "safc_full_cut_two")
	private String fullCutTwo;

	/**
	 * 满减优惠三
	 */
	@Column(name = "safc_full_cut_three")
	private String fullCutThree;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getStoreActivityId() {
		return storeActivityId;
	}

	public void setStoreActivityId(Integer storeActivityId) {
		this.storeActivityId = storeActivityId;
	}

	public String getFullCutOne() {
		return fullCutOne;
	}

	public void setFullCutOne(String fullCutOne) {
		this.fullCutOne = fullCutOne;
	}

	public String getFullCutTwo() {
		return fullCutTwo;
	}

	public void setFullCutTwo(String fullCutTwo) {
		this.fullCutTwo = fullCutTwo;
	}

	public String getFullCutThree() {
		return fullCutThree;
	}

	public void setFullCutThree(String fullCutThree) {
		this.fullCutThree = fullCutThree;
	}

}
