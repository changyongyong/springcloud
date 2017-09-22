package com.ddxxsyb.stock.http.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ddxxsyb.stock.http.request.GoodStatisticsReq;
import com.ddxxsyb.stock.http.request.StockChangeReq;
import com.ddxxsyb.stock.remote.mine.StockRemoteService;
import com.ddxxsyb.stock.service.StockService;
import com.syb.api.entity.ResultEntity;
import com.syb.api.entity.ServiceCode;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import springfox.documentation.annotations.ApiIgnore;

@Api(value="stock")
@RestController
@RequestMapping("/stock")
public class StockController extends BaseController {

	@Autowired
	protected StockService stockService;

	@Autowired
	protected StockRemoteService stockRemoteService;
	/**
	 * 
	 *功 能：服务测试 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@return	ResultEntity
	 */
	@PostMapping(value = "/test")
	@ApiIgnore
	public ResultEntity test() {
		return new ResultEntity(ServiceCode.SUCCESS, "商品库存服务正常");
	}

	/**
	 * 
	 *功 能： 测试拦截器<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月22日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@return	ResultEntity
	 */
	@PostMapping(value = "/testinter")
	@ApiIgnore
	public ResultEntity testinter() {
		return new ResultEntity(ServiceCode.SUCCESS, "测试通过拦截器");
	}
	
	@PostMapping(value = "/testinter2")
	@ApiIgnore
	public ResultEntity testinter2() {
		return stockRemoteService.testinter();
	}
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
	@PostMapping(value = "/sale")
	@ApiOperation(value="线下-订单销售消耗",httpMethod="POST",notes="线下-订单销售消耗",response=ResultEntity.class)
	@ApiImplicitParam(name = "stockChangeReq", value = "库存变动请求", required = true, dataType = "StockChangeReq")
	public ResultEntity sale(@RequestBody StockChangeReq stockChangeReq) {
		return stockService.sale(stockChangeReq.getOrderItems());
	}

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
	@PostMapping(value = "/order")
	@ApiOperation(value="线上-订单锁定消耗",httpMethod="POST",notes="线上-订单锁定消耗",response=ResultEntity.class)
	@ApiImplicitParam(name = "stockChangeReq", value = "库存变动请求", required = true, dataType = "StockChangeReq")
	public ResultEntity order(@RequestBody StockChangeReq stockChangeReq) {
		return stockService.order(stockChangeReq.getOrderItems());
	}

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
	@PostMapping(value = "/back")
	@ApiOperation(value="订单取消-商品回库增加数量 ",httpMethod="POST",notes="订单取消-商品回库增加数量 ",response=ResultEntity.class)
	@ApiImplicitParam(name = "stockChangeReq", value = "库存变动请求", required = true, dataType = "StockChangeReq")
	public ResultEntity back(@RequestBody StockChangeReq stockChangeReq) {
		return stockService.back(stockChangeReq.getOrderItems());
	}

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
	@PostMapping(value = "/arrived")
	@ApiOperation(value="线上-订单确认收货",httpMethod="POST",notes="线上-订单确认收货",response=ResultEntity.class)
	@ApiImplicitParam(name = "stockChangeReq", value = "库存变动请求", required = true, dataType = "StockChangeReq")
	public ResultEntity arrived(@RequestBody StockChangeReq stockChangeReq) {
		return stockService.arrived(stockChangeReq.getOrderItems());
	}

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
	@PostMapping(value = "/personChange")
	@ApiOperation(value="人工变动商品库存数量",httpMethod="POST",notes="人工变动商品库存数量",response=ResultEntity.class)
	@ApiImplicitParam(name = "stockChangeReq", value = "库存变动请求", required = true, dataType = "StockChangeReq")
	public ResultEntity personChange(@RequestBody StockChangeReq stockChangeReq) {
		return stockService.personChange(stockChangeReq.getOrderItems());
	}

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
	@PostMapping(value = "/add")
	@ApiOperation(value="入库增加",httpMethod="POST",notes="入库增加",response=ResultEntity.class)
	@ApiImplicitParam(name = "stockChangeReq", value = "库存变动请求", required = true, dataType = "StockChangeReq")
	public ResultEntity add(@RequestBody StockChangeReq stockChangeReq) {
		return stockService.add(stockChangeReq.getOrderItems());
	}

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
	@PostMapping(value = "/create")
	@ApiOperation(value="（上架）初始创建入库",httpMethod="POST",notes="（上架）初始创建入库",response=ResultEntity.class)
	@ApiImplicitParam(name = "stockChangeReq", value = "库存变动请求", required = true, dataType = "StockChangeReq")
	public ResultEntity create(@RequestBody StockChangeReq stockChangeReq) {
		return stockService.create(stockChangeReq.getOrderItems());
	}

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
	@PostMapping(value = "/goodSales")
	@ApiOperation(value="统计|日志 - 商品销售统计",httpMethod="POST",notes="统计|日志 - 商品销售统计",response=ResultEntity.class)
	@ApiImplicitParam(name = "goodStatisticsReq", value = "库存统计请求", required = true, dataType = "GoodStatisticsReq")
	public ResultEntity goodSales(@RequestBody GoodStatisticsReq goodStatisticsReq) {
		return stockService.goodSales(
				goodStatisticsReq.getCid(), goodStatisticsReq.getEnd(),
				goodStatisticsReq.getKeyword(), goodStatisticsReq.getLimit(),
				goodStatisticsReq.getOffset(), goodStatisticsReq.getStart(),
				goodStatisticsReq.getStoreId());
	}

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
	@PostMapping(value = "/goodHistory")
	@ApiOperation(value="统计|日志 - 库存变动明细 ",httpMethod="POST",notes="统计|日志 - 库存变动明细 ",response=ResultEntity.class)
	@ApiImplicitParam(name = "goodStatisticsReq", value = "库存统计请求", required = true, dataType = "GoodStatisticsReq")
	public ResultEntity goodHistory(@RequestBody GoodStatisticsReq goodStatisticsReq) {
		return stockService.goodHistory(
				goodStatisticsReq.getCid(), goodStatisticsReq.getDir(), goodStatisticsReq.getEnd(),
				goodStatisticsReq.getKeyword(), goodStatisticsReq.getLimit(),
				goodStatisticsReq.getOffset(), goodStatisticsReq.getStart(),
				goodStatisticsReq.getStoreId());
	}

}
