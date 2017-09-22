package com.ddxxsyb.activity.remote.mine;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.ddxxsyb.activity.dao.bean.EditStoreActivity;
import com.syb.api.entity.ResultEntity;
import com.syb.api.entity.ServiceException;

@FeignClient(name = "service-activity")
public interface ActivityRemoteService {

	/**
	 * 
	 *功 能：添加修改活动 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月26日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param editStoreActivity
	 *@param storeId
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/activity/edit", method = RequestMethod.POST)
	ResultEntity editActivity(EditStoreActivity editStoreActivity, Integer storeId)
			throws ServiceException;

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
	@RequestMapping(value = "/activity/detail", method = RequestMethod.GET)
	ResultEntity queryActivityDetail(Integer activityId, Integer storeId) throws ServiceException;

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
	@RequestMapping(value = "/activity/listpage", method = RequestMethod.GET)
	ResultEntity pageFindActivities(Integer limit, Integer offset, String[] status, Integer storeId)
			throws ServiceException;

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
	@RequestMapping(value = "/activity/pause", method = RequestMethod.GET)
	ResultEntity pauseActivity(Integer activityId, Integer storeId) throws ServiceException;

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
	@RequestMapping(value = "/activity/delete", method = RequestMethod.DELETE)
	ResultEntity delActivity(Integer activityId, Integer storeId) throws ServiceException;

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
	@RequestMapping(value = "/activity/nearby", method = RequestMethod.GET)
	ResultEntity queryActivitiesByStoreIds(Integer[] storeIds) throws ServiceException;

	/**
	 * 
	 *功 能：查询促销类型 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月27日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@return
	 *@throws ServiceException	ResultEntity
	 */
	@RequestMapping(value = "/activity/type", method = RequestMethod.GET)
	ResultEntity queryActivityType(Integer storeId) throws ServiceException;

}
