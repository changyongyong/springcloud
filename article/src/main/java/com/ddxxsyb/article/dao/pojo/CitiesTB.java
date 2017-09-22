package com.ddxxsyb.article.dao.pojo;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Table(name = "cities")
public class CitiesTB implements Serializable {

	private static final long serialVersionUID = 5404248038436426769L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "cityName")
	private String cityName;

	@Column(name = "createdAt")
	private Date createdAt;

	@Column(name = "updatedAt")
	private Date updatedAt;

	@Column(name = "ProvinceId")
	private Integer provinceId;

	@Column(name = "dadacityName")
	private String dadacityName;

	@Column(name = "dadacityCode")
	private String dadacityCode;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getCityName() {
		return cityName;
	}

	public void setCityName(String cityName) {
		this.cityName = cityName;
	}

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public Date getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Date updatedAt) {
		this.updatedAt = updatedAt;
	}

	public Integer getProvinceId() {
		return provinceId;
	}

	public void setProvinceId(Integer provinceId) {
		this.provinceId = provinceId;
	}

	public String getDadacityName() {
		return dadacityName;
	}

	public void setDadacityName(String dadacityName) {
		this.dadacityName = dadacityName;
	}

	public String getDadacityCode() {
		return dadacityCode;
	}

	public void setDadacityCode(String dadacityCode) {
		this.dadacityCode = dadacityCode;
	}

}
