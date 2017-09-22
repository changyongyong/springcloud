package com.ddxxsyb.stock.remote.mine;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.ddxxsyb.stock.http.request.GoodStatisticsReq;
import com.ddxxsyb.stock.http.request.StockChangeReq;
import com.syb.api.entity.ResultEntity;

@FeignClient(name = "service-stock")
public interface StockRemoteService {

	/**
	 * 
	 *功 能： 线下 - 订单销售消耗<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param stockChangeReq
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/stock/sale", method = RequestMethod.POST)
	ResultEntity sale(@RequestBody StockChangeReq stockChangeReq);

	/**
	 * 
	 *功 能：线上 - 订单锁定消耗<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param stockChangeReq
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/stock/order", method = RequestMethod.POST)
	ResultEntity order(@RequestBody StockChangeReq stockChangeReq);

	/**
	 * 
	 *功 能：线上 - 订单取消:商品回库增加数量 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param stockChangeReq
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/stock/back", method = RequestMethod.POST)
	ResultEntity back(@RequestBody StockChangeReq stockChangeReq);

	/**
	 * 
	 *功 能：线上 - 订单确认收货<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param stockChangeReq
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/stock/arrived", method = RequestMethod.POST)
	ResultEntity arrived(@RequestBody StockChangeReq stockChangeReq);

	/**
	 * 
	 *功 能：  人工变动商品库存数量<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param stockChangeReq
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/stock/personChange", method = RequestMethod.POST)
	ResultEntity personChange(@RequestBody StockChangeReq stockChangeReq);

	/**
	 * 
	 *功 能：入库增加 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param stockChangeReq
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/stock/add", method = RequestMethod.POST)
	ResultEntity add(@RequestBody StockChangeReq stockChangeReq);

	/**
	 * 
	 *功 能： （上架）初始创建入库<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param stockChangeReq
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/stock/create", method = RequestMethod.POST)
	ResultEntity create(@RequestBody StockChangeReq stockChangeReq);

	/**
	 * 
	 *功 能： 统计|日志 - 商品销售统计<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param stockChangeReq
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/stock/goodSales", method = RequestMethod.POST)
	ResultEntity goodSales(@RequestBody GoodStatisticsReq goodStatisticsReq);

	/**
	 * 
	 *功 能：统计|日志 - 库存变动明细 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param goodStatisticsReq
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/stock/goodHistory", method = RequestMethod.POST)
	ResultEntity goodHistory(@RequestBody GoodStatisticsReq goodStatisticsReq);

	@RequestMapping(value = "/stock/testinter", method = RequestMethod.POST)
	ResultEntity testinter();
}
