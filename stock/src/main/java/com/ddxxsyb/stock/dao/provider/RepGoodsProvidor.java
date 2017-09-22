package com.ddxxsyb.stock.dao.provider;

import java.text.ParseException;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.shengyibao.common.DateUtils;

public class RepGoodsProvidor {

	private static final Logger logger = LoggerFactory.getLogger(RepGoodsProvidor.class);
	
	public String goodsSales(
			String cid, String keyword, Integer offset, Integer limit, String start, String end,
			Integer storeId, String todayOrHistory) {
		String yesterdayEnd = DateUtils.getYesterday() + " 23:59:59";
		String todayStart = DateUtils.today() + " 00:00:00";
		StringBuffer sb = new StringBuffer();
		sb.append("select ");
		sb.append("biid.biid_catalog_id cid,sum(biid.biid_price_sum-biid.biid_cost_sum) gp,");
		sb.append(
				"ROUND(sum(biid.biid_price_sum-biid.biid_cost_sum)*100/sum(biid.biid_price_sum),2) gpp,");
		sb.append("sum(biid.biid_price_sum) money,biid.biid_product_name name,");
		sb.append("ABS(sum(biid.biid_change_amount)) quantity");
		sb.append(" from b_inventory_item_detail biid ");
		sb.append("where 1=1 ");

		if ("history".equals(todayOrHistory)) {
			// 历史统计为-1
			sb.append(" AND biid.biid_change_type = -1");
			// 日期
			sb.append(" AND biid.biid_created_at BETWEEN ");
			sb.append("'");
			sb.append(start);
			sb.append("'");
			sb.append(" AND ");
			sb.append("'");
			sb.append(end);
			sb.append("'");
		} else if ("today".equals(todayOrHistory)) {
			sb.append(" AND biid.biid_change_type in (-2,-10)");
			// 日期
			sb.append(" AND biid.biid_created_at BETWEEN ");
			sb.append("'");
			sb.append(start);
			sb.append("'");
			sb.append(" AND ");
			sb.append("'");
			sb.append(end);
			sb.append("'");
		} else if ("mix".equals(todayOrHistory)) {
			sb.append(
					" AND ((biid.biid_change_type = - 1 AND biid.biid_created_at BETWEEN '" + start
							+ "' AND '" + yesterdayEnd + "')");
			sb.append(" OR ");
			sb.append(
					"(biid.biid_change_type in (-2,-10) AND biid.biid_created_at BETWEEN '"
							+ todayStart + "' AND '" + end + "'))");
		}

		// 分类id
		if (!"-1".equals(cid)) {
			sb.append(" AND biid.biid_catalog_id = '");
			sb.append(cid);
			sb.append("'");
		}

		// 关键字
		if (StringUtils.isNotBlank(keyword)) {
			sb.append(" AND (biid.biid_product_name LIKE '%");
			sb.append(keyword);
			sb.append("%'");
			sb.append(" OR biid.biid_product_id = '");
			sb.append(keyword);
			sb.append("')");
		}

		// 店铺id
		if (storeId != null) {
			sb.append(" AND biid.biid_store_id = ");
			sb.append(storeId);
		}

		// 排序
		sb.append(" group by biid.biid_product_id,biid.biid_store_id");
		sb.append(" order by biid.biid_created_at desc ");

		sb.append(" LIMIT ");

		if (limit != null) {
			sb.append(limit);
		} else {
			sb.append(20);
		}
		sb.append(" OFFSET ");
		if (offset != null) {
			sb.append(offset);
		} else {
			sb.append(0);
		}
		sb.append(" FOR UPDATE");
		logger.info("销售记录：" + sb.toString());
		return sb.toString();
	}

	public String countSales(
			String cid, String keyword, String start, String end, Integer storeId,
			String todayOrHistory) {
		String yesterdayEnd = DateUtils.getYesterday() + " 23:59:59";
		String todayStart = DateUtils.today() + " 00:00:00";
		StringBuffer sb = new StringBuffer();
		sb.append(
				"select count(t.biid_product_id) totalCount,sum(t.gp) totalAmount,SUM(t.money) totalMoney from (");
		sb.append(
				"select biid.biid_product_id,sum(biid.biid_price_sum-biid.biid_cost_sum) gp,"
						+ "sum(biid.biid_price_sum) money");
		sb.append(" from b_inventory_item_detail biid ");
		sb.append("where 1=1 ");
		// 分类id
		if (!"-1".equals(cid)) {
			sb.append(" AND biid.biid_catalog_id = '");
			sb.append(cid);
			sb.append("'");
		}

		if ("history".equals(todayOrHistory)) {
			// 历史统计为-1
			sb.append(" AND biid.biid_change_type = -1");
			// 日期
			sb.append(" AND biid.biid_created_at BETWEEN ");
			sb.append("'");
			sb.append(start);
			sb.append("'");
			sb.append(" AND ");
			sb.append("'");
			sb.append(end);
			sb.append("'");
		} else if ("today".equals(todayOrHistory)) {
			sb.append(" AND biid.biid_change_type in (-2,-10)");
			// 日期
			sb.append(" AND biid.biid_created_at BETWEEN ");
			sb.append("'");
			sb.append(start);
			sb.append("'");
			sb.append(" AND ");
			sb.append("'");
			sb.append(end);
			sb.append("'");
		} else if ("mix".equals(todayOrHistory)) {
			sb.append(
					" AND ((biid.biid_change_type = - 1 AND biid.biid_created_at BETWEEN '" + start
							+ "' AND '" + yesterdayEnd + "')");
			sb.append(" OR ");
			sb.append(
					"(biid.biid_change_type in (-2,-10) AND biid.biid_created_at BETWEEN '"
							+ todayStart + "' AND '" + end + "'))");
		}

		// 关键字
		if (StringUtils.isNotBlank(keyword)) {
			sb.append(" AND (biid.biid_product_name LIKE '%");
			sb.append(keyword);
			sb.append("%'");
			sb.append(" OR biid.biid_product_id = '");
			sb.append(keyword);
			sb.append("')");
		}

		// 店铺id
		if (storeId != null) {
			sb.append(" AND biid.biid_store_id = ");
			sb.append(storeId);
		}

		// 排序
		sb.append(" group by biid.biid_product_id,biid.biid_store_id");
		sb.append(" order by biid.biid_created_at desc ");
		sb.append(") t");
		sb.append(" FOR UPDATE");
		logger.info("销售记录数：" + sb.toString());
		return sb.toString();
	}

	public String goodsHistory(
			String cid, String dir, String keyword, Integer offset, Integer limit, String start,
			String end, Integer storeId) {
		StringBuffer sb = new StringBuffer();
		sb.append("select ");
		sb.append(
				"biid.biid_stock amount,biid.biid_product_id barcode,IFNULL(ROUND(biid.biid_cost_sum/ABS(biid.biid_change_amount),2),biid.biid_cost) bid,");
		sb.append("biid.biid_catalog_id cid,biid.biid_change_type changeType,");
		sb.append("biid.biid_price money,biid.biid_product_name name,");
		sb.append("biid.biid_order_id orderid,biid.biid_change_amount quantity,");
		sb.append("UNIX_TIMESTAMP(biid.biid_created_at)*1000 timestamp");
		sb.append(" from b_inventory_item_detail biid ");
		sb.append("where 1=1 ");
		// 分类id
		if (!"-1".equals(cid)) {
			sb.append(" AND biid.biid_catalog_id = '");
			sb.append(cid);
			sb.append("'");
		}

		// 变动类型
		if ("in".equals(dir)) {
			sb.append(" AND biid.biid_change_type in (0,1,5)");
		} else if ("out".equals(dir)) {
			sb.append(" AND biid.biid_change_type in (-5,-10)");
		}

		// 关键字
		if (StringUtils.isNotBlank(keyword)) {
			sb.append(" AND (biid.biid_product_name LIKE '%");
			sb.append(keyword);
			sb.append("%'");
			sb.append(" OR biid.biid_product_id = '");
			sb.append(keyword);
			sb.append("')");
		}

		// 店铺id
		if (storeId != null) {
			sb.append(" AND biid.biid_store_id = ");
			sb.append(storeId);
		}

		// 日期
		sb.append(" AND biid.biid_created_at BETWEEN ");
		sb.append("'");
		sb.append(start);
		sb.append("'");
		sb.append(" AND ");
		sb.append("'");
		sb.append(end);
		sb.append("'");
		// 排序
		sb.append(" order by biid.biid_created_at desc ");

		sb.append(" LIMIT ");

		if (limit != null) {
			sb.append(limit);
		} else {
			sb.append(20);
		}
		sb.append(" OFFSET ");
		if (offset != null) {
			sb.append(offset);
		} else {
			sb.append(0);
		}
		sb.append(" FOR UPDATE");
		logger.info("销售明细：" + sb.toString());
		return sb.toString();

	}

	public String countHistory(
			String cid, String dir, String keyword, String start, String end, Integer storeId) {
		StringBuffer sb = new StringBuffer();
		sb.append("select count(t.biid_id) totalCount from (");
		sb.append("select biid.biid_id");
		sb.append(" from b_inventory_item_detail biid ");
		sb.append("where 1=1 ");
		// 分类id
		if (!"-1".equals(cid)) {
			sb.append(" AND biid.biid_catalog_id = '");
			sb.append(cid);
			sb.append("'");
		}

		// 变动类型
		if ("in".equals(dir)) {
			sb.append(" AND biid.biid_change_type in (0,1,5)");
		} else if ("out".equals(dir)) {
			sb.append(" AND biid.biid_change_type in (-5,-10)");
		}

		// 关键字
		if (StringUtils.isNotBlank(keyword)) {
			sb.append(" AND (biid.biid_product_name LIKE '%");
			sb.append(keyword);
			sb.append("%'");
			sb.append(" OR biid.biid_product_id = '");
			sb.append(keyword);
			sb.append("')");
		}

		// 店铺id
		if (storeId != null) {
			sb.append(" AND biid.biid_store_id = ");
			sb.append(storeId);
		}

		// 日期
		sb.append(" AND biid.biid_created_at BETWEEN ");
		sb.append("'");
		sb.append(start);
		sb.append("'");
		sb.append(" AND ");
		sb.append("'");
		sb.append(end);
		sb.append("'");
		// 排序
		sb.append(" order by biid.biid_created_at desc ");
		sb.append(") t");
		sb.append(" FOR UPDATE");
		logger.info("销售明细数：" + sb.toString());
		return sb.toString();
	}

	public static void main(String[] args) throws ParseException {
		RepGoodsProvidor rp = new RepGoodsProvidor();
		String sql = rp.goodsSales(
				"-1", "", 0, 10, "2017-08-07 00:00:00", "2017-08-09 23:59:59", 161652, "mix");
		System.out.println(sql);
	}
}
