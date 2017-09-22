package com.ddxxsyb.activity.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alibaba.fastjson.JSONObject;
import com.ddxxsyb.activity.dao.bean.ActivityType;
import com.ddxxsyb.activity.dao.bean.BatchStoreActivityBean;
import com.ddxxsyb.activity.dao.bean.EditStoreActivity;
import com.ddxxsyb.activity.dao.bean.FullCut;
import com.ddxxsyb.activity.dao.bean.StoreActivityBean;
import com.ddxxsyb.activity.dao.mapper.FullCutTBMapper;
import com.ddxxsyb.activity.dao.mapper.StoreActivityTBMapper;
import com.ddxxsyb.activity.dao.pojo.FullCutTB;
import com.ddxxsyb.activity.dao.pojo.StoreActivityTB;
import com.shengyibao.common.DateUtils;
import com.shengyibao.common.StringUtils;
import com.syb.api.entity.ResultEntity;
import com.syb.api.entity.ServiceCode;
import com.syb.api.entity.ServiceException;

@Service("activityService")
@Transactional
public class ActivityService {

	private static final Logger logger = LoggerFactory.getLogger(ActivityService.class);
	
	@Autowired
	private StoreActivityTBMapper storeActivityTBMapper;

	@Autowired
	private FullCutTBMapper fullCutTBMapper;

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
	public ResultEntity editActivity(EditStoreActivity editStoreActivity, Integer storeId)
			throws ServiceException {
		logger.info(
				"店铺" + storeId + "添加或修改活动，活动id:" + editStoreActivity.getActivityId() + "活动开始时间："
						+ editStoreActivity.getStartTime() + ";结束时间："
						+ editStoreActivity.getEndTime());
		Date nowDate = new Date();
		DateTime nowTime = new DateTime(nowDate).withTimeAtStartOfDay();// 当天0点
		ResultEntity resultEntity = null;
		if (StringUtils.isEmpty(editStoreActivity.getName())) {
			resultEntity = new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR, "活动名称不能为空");
			return resultEntity;
		}
		if (editStoreActivity.getName().length() > 10) {
			resultEntity = new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR, "活动名称最多10个字");
			return resultEntity;
		}
		if (StringUtils.isEmpty(editStoreActivity.getType())) {
			resultEntity = new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR, "活动类型不能为空");
			return resultEntity;
		}
		FullCut[] fullCuts = editStoreActivity.getFullCuts();
		if (ArrayUtils.isEmpty(fullCuts)) {
			resultEntity = new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR, "缺少优惠条件");
			return resultEntity;
		}
		if (fullCuts.length > 3) {
			resultEntity = new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR, "优惠条件过多,不能超过3个");
			return resultEntity;
		}
		Date startTime = DateUtils.getDateByStr(editStoreActivity.getStartTime());
		Date endTime = new DateTime(DateUtils.getDateByStr(editStoreActivity.getEndTime()))
				.plusDays(1).plusSeconds(-1).toDate();
		if (startTime == null || endTime == null) {
			resultEntity = new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR, "请选择正确的起始时间");
			return resultEntity;
		}
		if (startTime.compareTo(nowTime.toDate()) < 0) {
			resultEntity = new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR, "开始时间不能在当前时间之前");
			return resultEntity;
		}
		if (endTime.compareTo(startTime) <= 0) {
			resultEntity = new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR, "结束时间不能在开始时间之前");
			return resultEntity;
		}
		long time = endTime.getTime() - startTime.getTime();
		if (time / 1000 / 60 / 60 / 24 > 365) {// 超过365天
			resultEntity =
					new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR, "活动设置的时长不能超过365天");
			return resultEntity;
		}
		List<StoreActivityTB> readyList = storeActivityTBMapper
				.selectStoreActivitiesByStatus(storeId, StoreActivityTB.STATUS_READY);// 未开始的活动
		List<StoreActivityTB> onList = storeActivityTBMapper
				.selectStoreActivitiesByStatus(storeId, StoreActivityTB.STATUS_ON);// 进行中的活动
		logger.info(
				"店铺：" + storeId + "，当前未开始活动数量：" + readyList.size() + ",进行中活动数量：" + onList.size());
		if (editStoreActivity.getActivityId() == null) {// 添加时判断，修改不判断
			if (readyList.size() + onList.size() >= 3) {// 最多存在3个未开始和进行中的活动
				resultEntity = new ResultEntity(
						ServiceCode.SYSTEM_SERVICE_EXCEPTION, "最多可添加3个订单满减活动，不可再添加");
				return resultEntity;
			}
		}
		List<StoreActivityTB> readyOnList = new ArrayList<>(readyList.size() + onList.size());
		readyOnList.addAll(readyList);
		readyOnList.addAll(onList);

		StoreActivityTB storeActivityTB = new StoreActivityTB();
		FullCutTB fullCutTB = new FullCutTB();
		if (editStoreActivity.getActivityId() != null) {// 添加
			storeActivityTB =
					storeActivityTBMapper.selectByPrimaryKey(editStoreActivity.getActivityId());
			fullCutTB = fullCutTBMapper
					.selectFullCutByStoreActivityId(editStoreActivity.getActivityId());
			if (storeActivityTB == null || fullCutTB == null) {
				resultEntity = new ResultEntity(ServiceCode.NULL, "当前活动不存在");
				return resultEntity;
			}
			if (!StoreActivityTB.STATUS_READY.equals(storeActivityTB.getStatus())) {// 只有未进行的才能修改
				resultEntity = new ResultEntity(ServiceCode.NULL, "当前活动状态不支持修改，请确认");
				return resultEntity;
			}
			fullCutTB.setFullCutOne(null);
			fullCutTB.setFullCutTwo(null);
			fullCutTB.setFullCutThree(null);
		}
		if (CollectionUtils.isNotEmpty(readyOnList)) {// 判断新加的活动时间是否在未开始、进行中的活动时间区间
			for (StoreActivityTB tb : readyOnList) {
				if (!tb.getId().equals(storeActivityTB.getId())) {// 自己的活动不作为时间区间校验
					Date tbstartTime = tb.getStartTime();
					Date tbendTime = tb.getEndTime();
					if (!(startTime.compareTo(tbendTime) > 0
							|| endTime.compareTo(tbstartTime) < 0)) {
						resultEntity = new ResultEntity(
								ServiceCode.SYSTEM_SERVICE_EXCEPTION, "该时间段已有此类型活动，不可再添加");
						return resultEntity;
					}
				}
			}
		}

		storeActivityTB.setStoreId(storeId);
		storeActivityTB.setCreateTime(nowDate);
		storeActivityTB.setStartTime(startTime);
		storeActivityTB.setEndTime(endTime);
		storeActivityTB.setName(editStoreActivity.getName());
		storeActivityTB.setType(editStoreActivity.getType());
		// 当天的直接进行中
		if (new DateTime(startTime).withTimeAtStartOfDay().isEqual(nowTime)) {
			storeActivityTB.setStatus(StoreActivityTB.STATUS_ON);
		} else {
			storeActivityTB.setStatus(StoreActivityTB.STATUS_READY);
		}

		// 优惠排序
		List<FullCut> fullCutList = new ArrayList<>();

		for (int i = 0; i < fullCuts.length; i++) {
			fullCutList.add(fullCuts[i]);
			if (fullCuts[i].getFull().compareTo(fullCuts[i].getCut()) < 0) {
				resultEntity = new ResultEntity(-1, "优惠金额不能大于订单金额");
				return resultEntity;
			}
		}
		Collections.sort(fullCutList);
		if (fullCutList.size() == 2) {
			if (fullCutList.get(1).getFull().compareTo(fullCutList.get(0).getFull()) == 0) {
				resultEntity = new ResultEntity(-1, "优惠条件订单金额不能重复");
				return resultEntity;
			}
			if (fullCutList.get(1).getCut().compareTo(fullCutList.get(0).getCut()) <= 0) {
				resultEntity = new ResultEntity(-1, "订单满减设置不符合梯度要求，请调整优惠条件");
				return resultEntity;
			}
		} else if (fullCutList.size() == 3) {
			if (fullCutList.get(1).getFull().compareTo(fullCutList.get(0).getFull()) == 0
					|| fullCutList.get(2).getFull().compareTo(fullCutList.get(1).getFull()) == 0) {
				resultEntity = new ResultEntity(-1, "优惠条件订单金额不能重复");
				return resultEntity;
			}
			if (fullCutList.get(1).getCut().compareTo(fullCutList.get(0).getCut()) <= 0
					|| fullCutList.get(2).getCut().compareTo(fullCutList.get(1).getCut()) <= 0) {
				resultEntity = new ResultEntity(-1, "订单满减设置不符合梯度要求，请调整优惠条件");
				return resultEntity;
			}
		}
		for (int i = 0; i < fullCutList.size(); i++) {
			if (i == 0) {
				fullCutTB.setFullCutOne(JSONObject.toJSONString(fullCutList.get(0)));
			} else if (i == 1) {
				fullCutTB.setFullCutTwo(JSONObject.toJSONString(fullCutList.get(1)));
			} else if (i == 2) {
				fullCutTB.setFullCutThree(JSONObject.toJSONString(fullCutList.get(2)));
			}
		}
		try {
			if (editStoreActivity.getActivityId() != null) {// 修改
				storeActivityTBMapper.updateByPrimaryKeySelective(storeActivityTB);
				// 优惠条件插入
				fullCutTB.setStoreActivityId(storeActivityTB.getId());
				logger.info("活动修改成功,活动id：" + storeActivityTB.getId());
				fullCutTBMapper.updateByPrimaryKey(fullCutTB);
			} else {// 添加
				storeActivityTBMapper.insertSelective(storeActivityTB);
				// 优惠条件插入
				fullCutTB.setStoreActivityId(storeActivityTB.getId());
				logger.info("活动添加成功,活动id：" + storeActivityTB.getId());
				fullCutTBMapper.insert(fullCutTB);
			}
			resultEntity = new ResultEntity(editStoreActivity.getActivityId());
		} catch (Exception e) {
			logger.error("活动添加修改异常：" + e.getLocalizedMessage());
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "数据库操作异常");
		}
		return resultEntity;
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
	public ResultEntity queryActivityDetail(Integer activityId, Integer storeId)
			throws ServiceException {
		logger.info("查询活动详情  活动Id:" + activityId + ";店铺id" + storeId);
		if (activityId == null) {
			return new ResultEntity(-99, "活动id不能为空");
		}
		StoreActivityTB storeActivityTB = storeActivityTBMapper.selectByPrimaryKey(activityId);
		if (storeActivityTB == null) {
			return new ResultEntity(-1, "当前活动不存在");
		}
		FullCutTB fullCut = fullCutTBMapper.selectFullCutByStoreActivityId(storeActivityTB.getId());
		StoreActivityBean bean = this.returnInfo(storeActivityTB, fullCut);
		return new ResultEntity(bean);
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
	public ResultEntity pageFindActivities(
			Integer limit, Integer offset, String[] status, Integer storeId)
			throws ServiceException {
		logger.info(
				"分页查询活动列表  limit:" + limit + ",offset:" + offset + "状态：" + Arrays.toString(status)
						+ "店铺id" + storeId);
		if (status == null || status.length == 0) {
			return new ResultEntity(-99, "活动状态不能为空");
		}

		limit = limit == null ? 15 : limit;
		offset = offset == null ? 0 : offset;
		List<StoreActivityTB> list = storeActivityTBMapper
				.pageSelectActivitiesByStatusAndStoreId(status, storeId, limit, offset);
		logger.info("获得活动列表:" + list);
		StoreActivityBean[] beans = new StoreActivityBean[list.size()];
		for (int i = 0; i < list.size(); i++) {
			FullCutTB fullCut = fullCutTBMapper.selectFullCutByStoreActivityId(list.get(i).getId());
			beans[i] = this.returnInfo(list.get(i), fullCut);
		}
		logger.info("最终返回结果：" + beans);
		ResultEntity resultEntity = new ResultEntity(beans);
		resultEntity
				.setCount(storeActivityTBMapper.countActivitiesByStatusAndStoreId(status, storeId));
		return resultEntity;
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
	public ResultEntity pauseActivity(Integer activityId, Integer storeId) throws ServiceException {
		logger.info("店铺:" + storeId + ",活动:" + activityId + "暂停");
		ResultEntity resultEntity = null;
		try {
			StoreActivityTB storeActivityTB = storeActivityTBMapper.selectByPrimaryKey(activityId);
			if (storeActivityTB == null
					|| (!StoreActivityTB.STATUS_ON.equals(storeActivityTB.getStatus()))) {// 只有进行中的活动能被暂停
				resultEntity = new ResultEntity(-1, "该活动不存在或不能暂停");
				return resultEntity;
			}
			int editActivityStatus = storeActivityTBMapper
					.editActivityStatus(activityId, StoreActivityTB.STATUS_PAUSE);
			if (editActivityStatus > 0) {
				resultEntity = new ResultEntity(1, null);
			} else {
				resultEntity = new ResultEntity(-1, "暂停失败，未找到该活动");
			}
		} catch (Exception e) {
			logger.error(e.getLocalizedMessage());
			throw new ServiceException(-10, "数据库操作异常");
		}
		return resultEntity;
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
	public ResultEntity delActivity(Integer activityId, Integer storeId) throws ServiceException {
		logger.info("店铺:" + storeId + ",逻辑删除活动:" + activityId);
		ResultEntity resultEntity = null;
		try {
			StoreActivityTB storeActivityTB = storeActivityTBMapper.selectByPrimaryKey(activityId);
			if (storeActivityTB == null
					|| !(StoreActivityTB.STATUS_OFF.equals(storeActivityTB.getStatus())
							|| StoreActivityTB.STATUS_PAUSE.equals(storeActivityTB.getStatus()))) {// 只有暂停和已结束的活动能被删除
				resultEntity = new ResultEntity(-1, "该活动不存在或不能被删除");
				return resultEntity;
			}
			int logicDelete = storeActivityTBMapper.logicDelete(activityId);
			if (logicDelete > 0) {
				resultEntity = new ResultEntity(1, null);
			} else {
				resultEntity = new ResultEntity(-1, "删除失败，未找到该记录");
			}
		} catch (Exception e) {
			logger.error(e.getLocalizedMessage());
			throw new ServiceException(-10, "数据库操作异常");
		}
		return resultEntity;
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
	public ResultEntity queryActivitiesByStoreIds(Integer[] storeIds) throws ServiceException {
		logger.info("查询附近店铺活动:" + Arrays.toString(storeIds));
		if (storeIds == null || storeIds.length == 0) {
			return new ResultEntity(-99, "店铺id不能为空");
		}
		List<StoreActivityTB> list = storeActivityTBMapper.selectActivitiesBystoreIds(
				storeIds, new String[] { StoreActivityTB.STATUS_ON, StoreActivityTB.STATUS_READY });
		BatchStoreActivityBean[] batchBeans = new BatchStoreActivityBean[storeIds.length];
		for (int i = 0; i < batchBeans.length; i++) {
			batchBeans[i] = new BatchStoreActivityBean();
			batchBeans[i].setStoreId(storeIds[i]);
			List<StoreActivityBean> li = new ArrayList<>();
			for (StoreActivityTB storeActivityTB : list) {
				if (storeIds[i].equals(storeActivityTB.getStoreId())) {
					FullCutTB fullCut =
							fullCutTBMapper.selectFullCutByStoreActivityId(storeActivityTB.getId());
					li.add(this.returnInfo(storeActivityTB, fullCut));
				}
			}
			batchBeans[i].setStoreActivityBeans(li);
		}
		ResultEntity resultEntity = new ResultEntity(batchBeans);
		resultEntity.setCount(storeIds.length);
		return resultEntity;
	}

	/**
	 * 
	 *功 能： 封装返回信息<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月27日 v0.0.1 yuxy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param storeActivityTB
	 *@param fullCut
	 *@return	StoreActivityBean
	 */
	private StoreActivityBean returnInfo(StoreActivityTB storeActivityTB, FullCutTB fullCut) {
		StoreActivityBean bean = new StoreActivityBean();
		bean.setActivityId(storeActivityTB.getId());
		bean.setCreateTime(storeActivityTB.getCreateTime());
		bean.setEndTime(storeActivityTB.getEndTime());
		List<FullCut> fullCuts = new ArrayList<>();
		if (StringUtils.isNotBlank(fullCut.getFullCutOne())) {
			JSONObject jsonObj = JSONObject.parseObject(fullCut.getFullCutOne());
			FullCut fu = new FullCut();
			fu.setFull(jsonObj.getBigDecimal("full"));
			fu.setCut(jsonObj.getBigDecimal("cut"));
			fullCuts.add(fu);
		}
		if (StringUtils.isNotBlank(fullCut.getFullCutTwo())) {
			JSONObject jsonObj = JSONObject.parseObject(fullCut.getFullCutTwo());
			FullCut fu = new FullCut();
			fu.setFull(jsonObj.getBigDecimal("full"));
			fu.setCut(jsonObj.getBigDecimal("cut"));
			fullCuts.add(fu);
		}
		if (StringUtils.isNotBlank(fullCut.getFullCutThree())) {
			JSONObject jsonObj = JSONObject.parseObject(fullCut.getFullCutThree());
			FullCut fu = new FullCut();
			fu.setFull(jsonObj.getBigDecimal("full"));
			fu.setCut(jsonObj.getBigDecimal("cut"));
			fullCuts.add(fu);
		}
		bean.setFullCuts(fullCuts.toArray(new FullCut[0]));
		bean.setName(storeActivityTB.getName());
		bean.setStartTime(storeActivityTB.getStartTime());
		bean.setStatus(storeActivityTB.getStatus());
		String statusInfo = "";
		if (StoreActivityTB.STATUS_PAUSE.equals(storeActivityTB.getStatus())
				|| StoreActivityTB.STATUS_OFF.equals(storeActivityTB.getStatus())) {
			statusInfo = "已结束";
		} else if (StoreActivityTB.STATUS_READY.equals(storeActivityTB.getStatus())) {
			long start = storeActivityTB.getStartTime().getTime();
			long now = new Date().getTime();
			int day = (int) Math.ceil((start - now) / (1000 * 60 * 60 * 24)) + 1;// 不足一天算一天
			statusInfo = day + "天后开始";
		} else {
			long end = storeActivityTB.getEndTime().getTime();
			long now = new Date().getTime();
			int day = (int) Math.ceil((end - now) / (1000 * 60 * 60 * 24)) + 1;// 不足一天算一天
			statusInfo = day + "天后结束";
		}

		bean.setStatusInfo(statusInfo);
		bean.setType(storeActivityTB.getType());
		return bean;
	}

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
	public ResultEntity queryActivityType(Integer storeId) throws ServiceException {
		Map<String, String> dataMap = new HashMap<>();
		dataMap.put(ActivityType.FULL_CUT, ActivityType.getActivityType(ActivityType.FULL_CUT));
		return new ResultEntity(dataMap);
	}
}
