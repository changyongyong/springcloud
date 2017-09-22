package com.ddxxsyb.stock.dao.pojo;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "b_inventory_item_detail")
public class BInventoryItemDetail implements Serializable {

	private static final long serialVersionUID = 1814876579326823895L;

	/**
	 * 库存明细id
	 */
	@Id
	@Column(name = "biid_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer biidId;

	/**
	 * 库存id
	 */
	@Column(name = "biid_bsp_id")
	private Integer biidBspId;

	/**
	 * 变动类型
	 * 5   -   线上订单退单回库增加
	 * 1   -   入库增加
	 * 0   -   （上架）初始创建入库
	 * -1  -   当日商品出库汇总（ = 线上订单消耗 + 线下订单消耗 ）
	 * -2  -   订单确认收货
	 * -5  -   线上订单锁定消耗
	 * -10 -   线下订单消耗
	 * >= 0 ? '入库' : '出库'
	 */
	@Column(name = "biid_change_type")
	private Integer biidChangeType;

	/**
	 * 变动数量
	 */
	@Column(name = "biid_change_amount")
	private Integer biidChangeAmount;

	/**
	 * 变动后数量
	 */
	@Column(name = "biid_stock")
	private Integer biidStock;

	/**
	 * 销售总价
	 */
	@Column(name = "biid_price_sum")
	private BigDecimal biidPriceSum;

	/**
	 * 成本总价
	 */
	@Column(name = "biid_cost_sum")
	private BigDecimal biidCostSum;

	/**
	 * 创建时间
	 */
	@Column(name = "biid_created_at")
	private Date biidCreatedAt;

	/**
	 * 更新时间
	 */
	@Column(name = "biid_update_at")
	private Date biidUpdateAt;

	/**
	 * 订单id
	 */
	@Column(name = "biid_order_id")
	private String biidOrderId;

	/**
	 * 商品id(条码)
	 */
	@Column(name = "biid_product_id")
	private Long biidProductId;

	/**
	 * 店铺id
	 */
	@Column(name = "biid_store_id")
	private Integer biidStoreId;

	/**
	 * 价格
	 */
	@Column(name = "biid_price")
	private BigDecimal biidPrice;

	/**
	 * 冗余-商品成本价
	 */
	@Column(name = "biid_cost")
	private BigDecimal biidCost;
	
	/**
	 * 冗余-商品目录
	 */
	@Column(name = "biid_catalog_id")
	private String biidCataloId;
	
	/**
	 * 冗余-商品名称
	 */
	@Column(name = "biid_product_name")
	private String biidProductName;
	
	public Integer getBiidId() {
		return biidId;
	}

	public void setBiidId(Integer biidId) {
		this.biidId = biidId;
	}

	public Integer getBiidBspId() {
		return biidBspId;
	}

	public void setBiidBspId(Integer biidBspId) {
		this.biidBspId = biidBspId;
	}

	public Integer getBiidChangeType() {
		return biidChangeType;
	}

	public void setBiidChangeType(Integer biidChangeType) {
		this.biidChangeType = biidChangeType;
	}

	public Integer getBiidChangeAmount() {
		return biidChangeAmount;
	}

	public void setBiidChangeAmount(Integer biidChangeAmount) {
		this.biidChangeAmount = biidChangeAmount;
	}

	public Integer getBiidStock() {
		return biidStock;
	}

	public void setBiidStock(Integer biidStock) {
		this.biidStock = biidStock;
	}

	public Date getBiidCreatedAt() {
		return biidCreatedAt;
	}

	public void setBiidCreatedAt(Date biidCreatedAt) {
		this.biidCreatedAt = biidCreatedAt;
	}

	public Date getBiidUpdateAt() {
		return biidUpdateAt;
	}

	public void setBiidUpdateAt(Date biidUpdateAt) {
		this.biidUpdateAt = biidUpdateAt;
	}

	public String getBiidOrderId() {
		return biidOrderId;
	}

	public void setBiidOrderId(String biidOrderId) {
		this.biidOrderId = biidOrderId;
	}

	public Long getBiidProductId() {
		return biidProductId;
	}

	public void setBiidProductId(Long biidProductId) {
		this.biidProductId = biidProductId;
	}

	public Integer getBiidStoreId() {
		return biidStoreId;
	}

	public void setBiidStoreId(Integer biidStoreId) {
		this.biidStoreId = biidStoreId;
	}

	public BigDecimal getBiidPriceSum() {
		return biidPriceSum;
	}

	public void setBiidPriceSum(BigDecimal biidPriceSum) {
		this.biidPriceSum = biidPriceSum;
	}

	public BigDecimal getBiidCostSum() {
		return biidCostSum;
	}

	public void setBiidCostSum(BigDecimal biidCostSum) {
		this.biidCostSum = biidCostSum;
	}

	public BigDecimal getBiidPrice() {
		return biidPrice;
	}

	public void setBiidPrice(BigDecimal biidPrice) {
		this.biidPrice = biidPrice;
	}

	public BigDecimal getBiidCost() {
		return biidCost;
	}

	public void setBiidCost(BigDecimal biidCost) {
		this.biidCost = biidCost;
	}

	public String getBiidCataloId() {
		return biidCataloId;
	}

	public void setBiidCataloId(String biidCataloId) {
		this.biidCataloId = biidCataloId;
	}

	public String getBiidProductName() {
		return biidProductName;
	}

	public void setBiidProductName(String biidProductName) {
		this.biidProductName = biidProductName;
	}

}
