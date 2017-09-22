package com.ddxxsyb.activity.http.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.ddxxsyb.activity.dao.bean.EditStoreActivity;
import com.ddxxsyb.activity.service.ActivityService;
import com.syb.api.entity.ResultEntity;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;

@Api(value = "activity")
@RestController
@RequestMapping("/activity")
public class ActivityController extends BaseController {

	private static final Logger logger = LoggerFactory.getLogger(ActivityController.class);

	@Autowired
	private ActivityService activityService;

	/**
	 * 
	 *功 能：添加修改活动 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月27日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param editStoreActivity
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/edit", method = RequestMethod.POST)
	@ApiOperation(value = "添加修改活动", httpMethod = "POST", notes = "添加修改活动",
			response = ResultEntity.class)
	public ResultEntity editActivity(@RequestBody EditStoreActivity editStoreActivity) {
		logger.info("******进入添加修改活动Controller******");
		return activityService.editActivity(editStoreActivity, getStoreId());
	}

	/**
	 * 
	 *功 能： 活动详情<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月26日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param activityId
	 *@param storeId
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/detail", method = RequestMethod.GET)
	@ApiOperation(value = "活动详情", httpMethod = "GET", notes = "根据活动id活动详情",
			response = ResultEntity.class)
	@ApiImplicitParam(name = "activity_id", value = "活动id", required = true, dataType = "int",
			paramType = "query")
	public ResultEntity queryActivityDetail(
			@RequestParam(name = "activity_id") Integer activityId) {
		logger.info("******进入查询活动详情Controller******");
		return activityService.queryActivityDetail(activityId, getStoreId());
	}

	/**
	 * 
	 *功 能：分页查询活动 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月26日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param limit
	 *@param offset
	 *@param status
	 *@param storeId
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/listpage", method = RequestMethod.GET)
	@ApiOperation(value = "分页查询活动", httpMethod = "GET", notes = "根据状态分页查询活动",
			response = ResultEntity.class)
	@ApiImplicitParams({
			@ApiImplicitParam(name = "limit", value = "偏移量", required = true, dataType = "int",
					paramType = "query"),
			@ApiImplicitParam(name = "offset", value = "起始量", required = true, dataType = "int",
					paramType = "query"),
			@ApiImplicitParam(name = "status", value = "活动状态数组", required = true,
					dataType = "String", paramType = "query") })
	public ResultEntity pageFindActivities(
			@RequestParam(name = "limit") Integer limit,
			@RequestParam(name = "offset") Integer offset,
			@RequestParam(name = "status") String status) {
		logger.info("******进入分页活动查询Controller******");
		String[] statusArr;
		try {
			JSONArray jsonArray = JSON.parseArray(status);
			statusArr = jsonArray.toArray(new String[0]);
		} catch (Exception e) {
			return new ResultEntity(-1, "活动状态格式传入错误");
		}
		return activityService.pageFindActivities(limit, offset, statusArr, getStoreId());
	}

	/**
	 * 
	 *功 能： 暂停活动<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月26日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param activityId
	 *@param storeId
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/pause", method = RequestMethod.GET)
	@ApiOperation(value = "暂停活动", httpMethod = "GET", notes = "根据活动id暂停活动",
			response = ResultEntity.class)
	@ApiImplicitParam(name = "activity_id", value = "活动id", required = true, dataType = "int",
			paramType = "query")
	public ResultEntity editActivityStatus(@RequestParam(name = "activity_id") Integer activityId) {
		logger.info("******进入修改活动状态Controller******");
		return activityService.pauseActivity(activityId, getStoreId());
	}

	/**
	 * 
	 *功 能：删除活动 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月26日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param activityId
	 *@param storeId
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/delete", method = RequestMethod.DELETE)
	@ApiOperation(value = "删除活动 ", httpMethod = "DELETE", notes = "根据活动id删除活动 ",
			response = ResultEntity.class)
	@ApiImplicitParam(name = "activity_id", value = "活动id", required = true, dataType = "int",
			paramType = "query")
	public ResultEntity delActivity(@RequestParam(name = "activity_id") Integer activityId) {
		logger.info("******进入删除活动Controller******");
		return activityService.delActivity(activityId, getStoreId());
	}

	/**
	 * 
	 *功 能：查询附近店铺活动 <br />
	 *		供node调用，查询进行中和未开始的活动，首页进行中优先只展示一条，详情页都展示
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月26日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param activityId
	 *@param storeId
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/nearby", method = RequestMethod.GET)
	@ApiOperation(value = "查询附近店铺活动", httpMethod = "GET", notes = "根据店铺字符串数组查询附近店铺活动 ",
			response = ResultEntity.class)
	@ApiImplicitParam(name = "store_ids", value = "店铺id数组字符串", required = true, dataType = "String",
			paramType = "query")
	ResultEntity queryActivitiesByStoreIds(@RequestParam(name = "store_ids") String storeIds) {
		logger.info("******进入查询附近店铺活动Controller******请求参数：" + storeIds);
		Integer[] storeIdArr;
		try {
			JSONArray jsonArray = JSON.parseArray(storeIds);
			storeIdArr = jsonArray.toArray(new Integer[0]);
		} catch (Exception e) {
			return new ResultEntity(-1, "店铺id格式传入错误!!");
		}
		return activityService.queryActivitiesByStoreIds(storeIdArr);
	}

	/**
	 * 
	 *功 能：获取活动类型 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月27日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/type", method = RequestMethod.GET)
	@ApiOperation(value = "获取活动类型", httpMethod = "GET", notes = "获取活动类型 ",
			response = ResultEntity.class)
	ResultEntity queryActivityType() {
		logger.info("******进入查询活动类型Controller******");
		return activityService.queryActivityType(getStoreId());
	}

}
