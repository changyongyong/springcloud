package com.ddxxsyb.category.dao.pojo;

import java.io.Serializable;
import java.sql.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "base_catalog")
public class BaseCatalog implements Serializable{

	private static final long serialVersionUID = -8862333077881375571L;

	@Id
    @Column(name = "bc_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer bcId;
	
	@Column(name = "bc_dd_code")
	private String bcDdCode;
	
	@Column(name = "bc_sequence")
	private Integer bcSequence;
	
	@Column(name = "bc_title")
	private String bcTitle;
	
	@Column(name = "bc_parent_id")
	private Integer bcParentId;
	
	@Column(name = "bc_small_image_url")
	private String bcSmallImageUrl;
	
	@Column(name = "bc_medium_image_url")
	private String bcMediumImageUrl;
	
	@Column(name = "bc_large_image_url")
	private String bcLargeImageUrl;
	
	@Column(name = "bc_created_at")
	private Date bcCreatedAt;
	
	@Column(name = "bc_updated_at")
	private Date bcUpdatedAt;

	public Integer getBcId() {
		return bcId;
	}

	public void setBcId(Integer bcId) {
		this.bcId = bcId;
	}

	public String getBcDdCode() {
		return bcDdCode;
	}

	public void setBcDdCode(String bcDdCode) {
		this.bcDdCode = bcDdCode;
	}

	public Integer getBcSequence() {
		return bcSequence;
	}

	public void setBcSequence(Integer bcSequence) {
		this.bcSequence = bcSequence;
	}

	public String getBcTitle() {
		return bcTitle;
	}

	public void setBcTitle(String bcTitle) {
		this.bcTitle = bcTitle;
	}

	public Integer getBcParentId() {
		return bcParentId;
	}

	public void setBcParentId(Integer bcParentId) {
		this.bcParentId = bcParentId;
	}

	public String getBcSmallImageUrl() {
		return bcSmallImageUrl;
	}

	public void setBcSmallImageUrl(String bcSmallImageUrl) {
		this.bcSmallImageUrl = bcSmallImageUrl;
	}

	public String getBcMediumImageUrl() {
		return bcMediumImageUrl;
	}

	public void setBcMediumImageUrl(String bcMediumImageUrl) {
		this.bcMediumImageUrl = bcMediumImageUrl;
	}

	public String getBcLargeImageUrl() {
		return bcLargeImageUrl;
	}

	public void setBcLargeImageUrl(String bcLargeImageUrl) {
		this.bcLargeImageUrl = bcLargeImageUrl;
	}

	public Date getBcCreatedAt() {
		return bcCreatedAt;
	}

	public void setBcCreatedAt(Date bcCreatedAt) {
		this.bcCreatedAt = bcCreatedAt;
	}

	public Date getBcUpdatedAt() {
		return bcUpdatedAt;
	}

	public void setBcUpdatedAt(Date bcUpdatedAt) {
		this.bcUpdatedAt = bcUpdatedAt;
	}
	
	
	
	
	
	
}
