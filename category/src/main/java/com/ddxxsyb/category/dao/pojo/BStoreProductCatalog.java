package com.ddxxsyb.category.dao.pojo;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Table(name = "b_store_product_catalog")
public class BStoreProductCatalog implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "bspc_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer bspcId;

	@Column(name = "bspc_store_id")
	private Integer bspcStoreId;

	@Column(name = "bspc_catalog_id")
	private String bspcCatalogId; // 目录ID

	@Column(name = "bspc_parent_catalog_id")
	private String bspcParentCatalogId; // 父节点 默认root

	@Column(name = "bspc_sequence")
	private Integer bspcSequence; // 序列

	@Column(name = "bspc_package")
	private BigDecimal bspcPackage; // 打包费

	@Column(name = "bspc_catalog_name")
	private String bspcCatalogName; // 目录名称

	@Column(name = "bspc_catalog_image_url")
	private String bspcCatalogImageUrl; // 图片

	@Column(name = "bspc_show_in_select")
	private Integer bspcShowInSelect; // 是否选中 0-false，1-true

	@Column(name = "bspc_created_at")
	private Date bspcCreatedAt;

	@Column(name = "bspc_updated_at")
	private Date bspcUpdatedAt;
	
	@Column(name = "bspc_flag")
	private Integer bspcFlag;

	public Integer getBspcId() {
		return bspcId;
	}

	public void setBspcId(Integer bspcId) {
		this.bspcId = bspcId;
	}

	public Integer getBspcStoreId() {
		return bspcStoreId;
	}

	public void setBspcStoreId(Integer bspcStoreId) {
		this.bspcStoreId = bspcStoreId;
	}

	public String getBspcCatalogId() {
		return bspcCatalogId;
	}

	public void setBspcCatalogId(String bspcCatalogId) {
		this.bspcCatalogId = bspcCatalogId;
	}

	public String getBspcParentCatalogId() {
		return bspcParentCatalogId;
	}

	public void setBspcParentCatalogId(String bspcParentCatalogId) {
		this.bspcParentCatalogId = bspcParentCatalogId;
	}

	public Integer getBspcSequence() {
		return bspcSequence;
	}

	public void setBspcSequence(Integer bspcSequence) {
		this.bspcSequence = bspcSequence;
	}

	public BigDecimal getBspcPackage() {
		return bspcPackage;
	}

	public void setBspcPackage(BigDecimal bspcPackage) {
		this.bspcPackage = bspcPackage;
	}

	public String getBspcCatalogName() {
		return bspcCatalogName;
	}

	public void setBspcCatalogName(String bspcCatalogName) {
		this.bspcCatalogName = bspcCatalogName;
	}

	public String getBspcCatalogImageUrl() {
		return bspcCatalogImageUrl;
	}

	public void setBspcCatalogImageUrl(String bspcCatalogImageUrl) {
		this.bspcCatalogImageUrl = bspcCatalogImageUrl;
	}

	public Integer getBspcShowInSelect() {
		return bspcShowInSelect;
	}

	public void setBspcShowInSelect(Integer bspcShowInSelect) {
		this.bspcShowInSelect = bspcShowInSelect;
	}

	public Date getBspcCreatedAt() {
		return bspcCreatedAt;
	}

	public void setBspcCreatedAt(Date bspcCreatedAt) {
		this.bspcCreatedAt = bspcCreatedAt;
	}

	public Date getBspcUpdatedAt() {
		return bspcUpdatedAt;
	}

	public void setBspcUpdatedAt(Date bspcUpdatedAt) {
		this.bspcUpdatedAt = bspcUpdatedAt;
	}
	

	public Integer getBspcFlag() {
		return bspcFlag;
	}

	public void setBspcFlag(Integer bspcFlag) {
		this.bspcFlag = bspcFlag;
	}

	@Override
	public String toString() {
		return "ProductCatalog [bspcId=" + bspcId + ", bspcStoreId=" + bspcStoreId
				+ ", bspcCatalogId=" + bspcCatalogId + ", bspcParentCatalogId="
				+ bspcParentCatalogId + ", bspcSequence=" + bspcSequence + ", bspcPackage="
				+ bspcPackage + ", bspcCatalogName=" + bspcCatalogName + ", bspcCatalogImageUrl="
				+ bspcCatalogImageUrl + ", bspcShowInSelect=" + bspcShowInSelect
				+ ", bspcCreatedAt=" + bspcCreatedAt + ", bspcUpdatedAt=" + bspcUpdatedAt + "]";
	}
}
