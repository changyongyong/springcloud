package com.ddxxsyb.stock.dao.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.ResultType;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.SelectProvider;

import com.ddxxsyb.stock.dao.pojo.BInventoryItemDetail;
import com.ddxxsyb.stock.dao.provider.RepGoodsProvidor;
import com.ddxxsyb.stock.dao.view.GoodsHistory;
import com.ddxxsyb.stock.dao.view.GoodsSales;

import tk.mybatis.mapper.common.Mapper;

/**
 * 
 *<li>模块名 : BInventoryItemDetailTBMapper<br />
 *<li>文件名 : BInventoryItemDetailTBMapper.java<br />
 *<li>创建时间 : 2017年6月30日<br />
 *<li>实现功能 : 
 *<li><br />作者 : liuhx
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年6月30日 v0.0.1 liuhx 创建<br />
 */
public interface BInventoryItemDetailTBMapper extends Mapper<BInventoryItemDetail> {

	@SelectProvider(type = RepGoodsProvidor.class, method = "goodsSales")
	@Results({ @Result(column = "cid", property = "cid"), @Result(column = "gp", property = "gp"),
			@Result(column = "gpp", property = "gpp"),
			@Result(column = "money", property = "money"),
			@Result(column = "name", property = "name"), @Result(column = "per", property = "per"),
			@Result(column = "quantity", property = "quantity") })
	List<GoodsSales> goodsSales(
			String cid, String keyword, Integer offset, Integer limit, String start, String end,
			Integer storeId, String todayOrHistory);

	@SelectProvider(type = RepGoodsProvidor.class, method = "countSales")
	@ResultType(value = Map.class)
	Map<String, Object> countSales(
			String cid, String keyword, String start, String end, Integer storeId,
			String todayOrHistory);

	@SelectProvider(type = RepGoodsProvidor.class, method = "goodsHistory")
	@Results({ @Result(column = "amount", property = "amount"),
			@Result(column = "barcode", property = "barcode"),
			@Result(column = "bid", property = "bid"), @Result(column = "cid", property = "cid"),
			@Result(column = "changeType", property = "changeType"),
			@Result(column = "money", property = "money"),
			@Result(column = "name", property = "name"),
			@Result(column = "quantity", property = "quantity"),
			@Result(column = "timestamp", property = "timestamp"),
			@Result(column = "orderid", property = "orderid") })
	List<GoodsHistory> goodsHistory(
			String cid, String dir, String keyword, Integer offset, Integer limit, String start,
			String end, Integer storeId);

	@SelectProvider(type = RepGoodsProvidor.class, method = "countHistory")
	@ResultType(value = Map.class)
	Map<String, Object> countHistory(
			String cid, String dir, String keyword, String start, String end, Integer storeId);

	@Select(value = "select biid_store_id,biid_product_id,sum(biid_change_amount) biid_change_amount,biid_price,"
			+ "sum(biid_price_sum) biid_price_sum,sum(biid_cost_sum) biid_cost_sum from b_inventory_item_detail "
			+ "where biid_change_type in (-2,-10) AND biid_created_at BETWEEN #{yesterdayStart} AND #{yesterdayEnd} "
			+ "GROUP BY biid_store_id,biid_product_id")
	List<BInventoryItemDetail> selectYesterdayDetail(
			@Param("yesterdayStart") String yesterdayStart,
			@Param("yesterdayEnd") String yesterdayEnd);

}
