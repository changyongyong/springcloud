package com.ddxxsyb.order.http.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ddxxsyb.order.http.bean.order.GetOrderByIdReq;
import com.ddxxsyb.order.service.OrderService;
import com.syb.api.entity.ResultEntity;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;

@Api(value = "order")
@RestController
@RequestMapping("/order")
public class OrderController extends BaseController {

	private static Logger log = LoggerFactory.getLogger(OrderController.class);

	@Autowired
	protected OrderService orderService;

	@PostMapping(value = "/test")
	public String test() {
		orderService.test();
		return "ok";
	}

	/**
	 * 
	 *功 能： 按照id获取订单<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月22日 v0.0.1 DELL 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param getOrderByIdReq
	 *@return	String
	 */
	@ApiOperation(value = "获取订单信息", httpMethod = "POST", notes = "根据ID获取订单信息",
			response = ResultEntity.class)
	@ApiImplicitParam(name = "getOrderByIdReq", value = "订单ID", required = true,
			dataType = "GetOrderByIdReq")
	@PostMapping(value = "/getOrderById")
	public String getOrderById(@RequestBody GetOrderByIdReq getOrderByIdReq) {
		orderService.test();
		log.trace("==================trace======================");
		log.debug("==================debug==================");
		log.info("==================info==================");
		log.warn("==================warn==================");
		log.error("==================error==================");
		return "ok1";
	}

	@PostMapping(value = "/t")
	public String t(@RequestBody GetOrderByIdReq getOrderByIdReq) {
		orderService.test();
		log.trace("==================trace======================");
		log.debug("==================debug==================");
		log.info("==================info==================");
		log.warn("==================warn==================");
		log.error("==================error==================");
		return "ok1";
	}

}
