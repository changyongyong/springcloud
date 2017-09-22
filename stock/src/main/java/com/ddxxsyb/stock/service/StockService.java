package com.ddxxsyb.stock.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.ParseException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ddxxsyb.stock.dao.mapper.BInventoryItemDetailTBMapper;
import com.ddxxsyb.stock.dao.pojo.BInventoryItemDetail;
import com.ddxxsyb.stock.dao.view.GoodsHistory;
import com.ddxxsyb.stock.dao.view.GoodsSales;
import com.ddxxsyb.stock.dao.view.UpdateGoodInfo;
import com.shengyibao.common.DateUtils;
import com.shengyibao.common.DecimalCalculate;
import com.shengyibao.common.GsonUtil;
import com.syb.api.entity.ResultEntity;
import com.syb.api.entity.ServiceException;

@Service("stockService")
@Transactional
public class StockService {

	private static final Logger logger = LoggerFactory.getLogger(StockService.class);

	private static final String TODAY = "today";

	private static final String HISTORY = "history";

	private static final String MIX = "mix";

	@Autowired
	private BInventoryItemDetailTBMapper bInventoryItemDetailTBMapper;

	public ResultEntity sale(List<UpdateGoodInfo> orderItems) throws ServiceException{
		return createInventoryHistory(orderItems, -10);
	}

	public ResultEntity order(List<UpdateGoodInfo> orderItems) throws ServiceException{
		return createInventoryHistory(orderItems, -5);
	}

	public ResultEntity back(List<UpdateGoodInfo> orderItems) throws ServiceException{
		return createInventoryHistory(orderItems, 5);
	}

	public ResultEntity arrived(List<UpdateGoodInfo> orderItems) throws ServiceException{
		return createInventoryHistory(orderItems, -2);
	}

	public ResultEntity personChange(List<UpdateGoodInfo> orderItems) throws ServiceException{
		return createInventoryHistory(orderItems, 99);
	}

	
	public ResultEntity add(List<UpdateGoodInfo> orderItems) throws ServiceException{
		return createInventoryHistory(orderItems, 1);
	}

	public ResultEntity create(List<UpdateGoodInfo> orderItems) throws ServiceException{
		return createInventoryHistory(orderItems, 0);
	}

	/**
	 * 
	 * 功 能：记录流水明细 <br />
	 *
	 * <br />
	 * ----------------------------------------------------------------<br />
	 * 修改记录 ：<br />
	 * 日 期 版本 修改人 修改内容<br />
	 * 2017年6月29日 v0.0.1 liuhx 创建<br />
	 * <br />
	 * ----------------------------------------------------------------
	 * 
	 * @param orderItems
	 * @param invPurpos
	 *            void
	 */
	private ResultEntity createInventoryHistory(List<UpdateGoodInfo> orderItems, int invPurpos) throws ServiceException{
		try {
			logger.info("开始插入历史库存,订单数：" + orderItems.size());
			for (int i = 0; i < orderItems.size(); i++) {
				BInventoryItemDetail inventoryItemDetail = new BInventoryItemDetail();
				UpdateGoodInfo item = orderItems.get(i);

				inventoryItemDetail.setBiidBspId(item.getBspId());
				inventoryItemDetail.setBiidChangeType(invPurpos);
				inventoryItemDetail.setBiidChangeAmount(item.getAmount());
				inventoryItemDetail.setBiidStock(item.getStock());
				inventoryItemDetail.setBiidCreatedAt(new Date());
				inventoryItemDetail.setBiidUpdateAt(inventoryItemDetail.getBiidCreatedAt());
				inventoryItemDetail.setBiidOrderId(item.getOid());
				inventoryItemDetail.setBiidStoreId(item.getStoreId());
				inventoryItemDetail.setBiidProductId(new Long(item.getBarcode()));
				inventoryItemDetail.setBiidPrice(item.getPrice());
				inventoryItemDetail.setBiidCost(item.getCost());//成本价
				inventoryItemDetail.setBiidCataloId(item.getCid());//目录id
				inventoryItemDetail.setBiidProductName(item.getName());//商品名称
				
				BigDecimal price_sum = item.getPrice().multiply(new BigDecimal(item.getAmount())).setScale(2,
						RoundingMode.HALF_UP);
				BigDecimal cost_sum = item.getCost().multiply(new BigDecimal(item.getAmount())).setScale(2,
						RoundingMode.HALF_UP);

				inventoryItemDetail.setBiidPriceSum(price_sum.abs());
				inventoryItemDetail.setBiidCostSum(cost_sum.abs());

				// 根据变动计算变动后的库存数量
				// xxx stock为变动前数量，需要计算
				if (invPurpos != -2) {// 线上订单确认收货时无需还原库存
					int stockQty = item.getStock() + item.getAmount();
					inventoryItemDetail.setBiidStock(stockQty);
				}
				logger.info("插入的库存明细：" + GsonUtil.GsonString(inventoryItemDetail));
				bInventoryItemDetailTBMapper.insertSelective(inventoryItemDetail);
			}
			return new ResultEntity();
		} catch (Exception e) {
			logger.error("插入历史库存出错:{}",ExceptionUtils.getStackTrace(e));
			throw new ServiceException(500,"插入历史库存出错");
		}
	}
	
	public ResultEntity goodSales(String cid, String end, String keyword, Integer limit, Integer offset, String start,
			Integer storeId) throws ServiceException{
		logger.info("开始查询销售统计！");
		start += " 00:00:00";
		end += " 23:59:59";
		try {
			DateUtils.parseDate(start, DateUtils.DATE_FORMAT_DATETIME);
			DateUtils.parseDate(end, DateUtils.DATE_FORMAT_DATETIME);

			int r = DateUtils.compareDate(DateUtils.parseDate(end, DateUtils.DATE_FORMAT_DATETIME),
					DateUtils.parseDate(start, DateUtils.DATE_FORMAT_DATETIME), Calendar.DATE);
			if (r < 0) {
				throw new ServiceException(500,"结束日期大于等于开始日期");
			}
		} catch (ParseException e) {
			throw new ServiceException(500,"非法日期格式");
		}

		logger.info("开始时间：" + start + ",结束时间：" + end);

		// 销售统计列表
		List<GoodsSales> goodsSales = null;
		// 销售统计结果
		Map<String, Object> goodsSalesResult = null;

		// 毛利合计
		BigDecimal totalAmount = new BigDecimal(0.0);
		// 销售总额
		BigDecimal totalMoney = new BigDecimal(0.0);
		// 结果总数
		Long totalCount = 0l;
		try {
			if (DateUtils.compareDate(DateUtils.parseDate(start, DateUtils.DATE_FORMAT_DATETIME), new Date(),
					Calendar.DATE) == 0) {
				// 今天
				goodsSales = bInventoryItemDetailTBMapper.goodsSales(cid, keyword, offset, limit, start, end, storeId,
						TODAY);
				goodsSalesResult = bInventoryItemDetailTBMapper.countSales(cid, keyword, start, end, storeId, TODAY);

			} else if (DateUtils.compareDate(DateUtils.parseDate(end, DateUtils.DATE_FORMAT_DATETIME), new Date(),
					Calendar.DATE) < 0) {
				// 历史
				goodsSales = bInventoryItemDetailTBMapper.goodsSales(cid, keyword, offset, limit, start, end, storeId,
						HISTORY);
				goodsSalesResult = bInventoryItemDetailTBMapper.countSales(cid, keyword, start, end, storeId, HISTORY);

			} else if (DateUtils.compareDate(DateUtils.parseDate(start, DateUtils.DATE_FORMAT_DATETIME), new Date(),
					Calendar.DATE) < 0
					&& DateUtils.compareDate(DateUtils.parseDate(end, DateUtils.DATE_FORMAT_DATETIME), new Date(),
							Calendar.DATE) >= 0) {
				// 混合
				goodsSales = bInventoryItemDetailTBMapper.goodsSales(cid, keyword, offset, limit, start, end, storeId,
						MIX);

				goodsSalesResult = bInventoryItemDetailTBMapper.countSales(cid, keyword, start, end, storeId, MIX);

			}
		} catch (ParseException e) {
			logger.error("日期转换出错!");
			throw new ServiceException(500, "日期转换出错!");
		}

		totalAmount = (BigDecimal) goodsSalesResult.get("totalAmount");
		totalMoney = (BigDecimal) goodsSalesResult.get("totalMoney");
		totalCount = (Long) goodsSalesResult.get("totalCount");

		// 计算每笔记录的销售金额占比
		for (GoodsSales gs : goodsSales) {
			if (totalMoney.doubleValue() > 0) {
				// 保留两位小数
				gs.setPer(DecimalCalculate.div(gs.getMoney() * 100, totalMoney.doubleValue(), 2));
			} else {
				gs.setPer(0.0);
			}
		}
		Map<String, Object> resultMap = new HashMap<>();
		resultMap.put("count", totalCount);
		resultMap.put("gps", totalAmount != null ? totalAmount : 0.0);
		resultMap.put("sales", goodsSales);
		logger.info("销售统计查询结果-------->" + GsonUtil.GsonString(resultMap));
		return new ResultEntity(resultMap);
	}

	
	public ResultEntity goodHistory(String cid, String dir, String end, String keyword, Integer limit, Integer offset,
			String start, Integer storeId) throws ServiceException{
		logger.info("开始查询销售历史明细！");
		start += " 00:00:00";
		end += " 23:59:59";
		try {
			DateUtils.parseDate(start, DateUtils.DATE_FORMAT_DATETIME);
			DateUtils.parseDate(end, DateUtils.DATE_FORMAT_DATETIME);

			int r = DateUtils.compareDate(DateUtils.parseDate(end, DateUtils.DATE_FORMAT_DATETIME),
					DateUtils.parseDate(start, DateUtils.DATE_FORMAT_DATETIME), Calendar.DATE);
			if (r < 0) {
				throw new ServiceException(500, "结束日期大于等于开始日期!");
			}
		} catch (ParseException e) {
			logger.error("日期转换出错：{}",ExceptionUtils.getStackTrace(e));
			throw new ServiceException(500, "日期转换出错!");
		}

		List<GoodsHistory> goodsHistories = bInventoryItemDetailTBMapper.goodsHistory(cid, dir, keyword, offset, limit,
				start, end, storeId);
		Map<String, Object> goodsHistoryResult = bInventoryItemDetailTBMapper.countHistory(cid, dir, keyword, start,
				end, storeId);

		// 结果总数
		Long totalCount = (Long) goodsHistoryResult.get("totalCount");

		for (GoodsHistory gh : goodsHistories) {
			if (gh.getChangeType() >= 0) {
				gh.setDir("入库");
			} else if (gh.getChangeType() < 0) {
				gh.setDir("出库");
			}

			if (StringUtils.isBlank(gh.getOrderid())) {
				gh.setOid("false");
			} else {
				gh.setOid(gh.getOrderid());
			}
		}

		Map<String, Object> resultMap = new HashMap<>();
		resultMap.put("count", totalCount);
		resultMap.put("log", goodsHistories);
		return new ResultEntity(resultMap);
	}

}
