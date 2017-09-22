package com.syb.miniapps.dao.model;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "online_shopping_cat")
public class OnlineShoppingCat implements Serializable {

	/**
	* 
	*/
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "osc_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer oscId; // '自增主键

	@Column(name = "osc_user_id")
	private Integer oscUserId; // 用户id

	@Column(name = "osc_store_id")
	private Integer oscStoreId; // 店铺id

	@Column(name = "osc_product_id")
	private Integer oscProductId; // 商品id

	@Column(name = "osc_product_amount")
	private Integer oscProductAmount; // 商品数量

	@Column(name = "osc_created_at") // 创建时间
	private Date oscCreatedAt;

	@Column(name = "osc_updated_at")
	private Date oscUpdatedAt; // 更新时间

	public Integer getOscId() {
		return oscId;
	}

	public void setOscId(Integer oscId) {
		this.oscId = oscId;
	}

	public Integer getOscUserId() {
		return oscUserId;
	}

	public void setOscUserId(Integer oscUserId) {
		this.oscUserId = oscUserId;
	}

	public Integer getOscStoreId() {
		return oscStoreId;
	}

	public void setOscStoreId(Integer oscStoreId) {
		this.oscStoreId = oscStoreId;
	}

	public Integer getOscProductId() {
		return oscProductId;
	}

	public void setOscProductId(Integer oscProductId) {
		this.oscProductId = oscProductId;
	}

	public Integer getOscProductAmount() {
		return oscProductAmount;
	}

	public void setOscProductAmount(Integer oscProductAmount) {
		this.oscProductAmount = oscProductAmount;
	}

	public Date getOscCreatedAt() {
		return oscCreatedAt;
	}

	public void setOscCreatedAt(Date oscCreatedAt) {
		this.oscCreatedAt = oscCreatedAt;
	}

	public Date getOscUpdatedAt() {
		return oscUpdatedAt;
	}

	public void setOscUpdatedAt(Date oscUpdatedAt) {
		this.oscUpdatedAt = oscUpdatedAt;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Override
	public String toString() {
		return "OnlineShoppingCat [oscId=" + oscId + ", oscUserId=" + oscUserId + ", oscStoreId="
				+ oscStoreId + ", oscProductId=" + oscProductId + ", oscProductAmount="
				+ oscProductAmount + ", oscCreatedAt=" + oscCreatedAt + ", oscUpdatedAt="
				+ oscUpdatedAt + "]";
	}

}
