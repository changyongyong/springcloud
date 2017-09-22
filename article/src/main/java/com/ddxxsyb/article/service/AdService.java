package com.ddxxsyb.article.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ddxxsyb.article.dao.Page;
import com.ddxxsyb.article.dao.bean.AttachedScreenSearchBean;
import com.ddxxsyb.article.dao.bean.ModifyAttachedScreenBean;
import com.ddxxsyb.article.dao.bean.ScreenAdView;
import com.ddxxsyb.article.dao.mapper.AttachedScreenAdTBMapper;
import com.ddxxsyb.article.dao.mapper.CitiesTBMapper;
import com.ddxxsyb.article.dao.mapper.ScreenAdSortTBMapper;
import com.ddxxsyb.article.dao.pojo.AttachedScreenAdTB;
import com.ddxxsyb.article.dao.pojo.ScreenAdSortTB;
import com.shengyibao.common.DateUtils;
import com.shengyibao.common.StringUtils;
import com.syb.api.entity.ResultEntity;
import com.syb.api.entity.ServiceCode;
import com.syb.api.entity.ServiceException;

@Service("adService")
@Transactional
public class AdService {

	private static final Logger logger = LoggerFactory.getLogger(AdService.class);

	@Autowired
	private AttachedScreenAdTBMapper attachedScreenAdTBMapper;

	@Autowired
	private ScreenAdSortTBMapper adSortTBMapper;

	@Autowired
	private CitiesTBMapper citiesTBMapper;

	/**
	 * 
	 *功 能：获取副屏广告图 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年6月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param storeId
	 *@param cityId
	 *@return
	 *@throws ServiceException	ResultEntity
	 */
	public ResultEntity getScreenAds(Integer storeId, Integer cityId, Integer limit)
			throws ServiceException {
		ResultEntity resultEntity = null;
		logger.info("获取城市id:" + cityId + "的广告图");
		try {
			List<ScreenAdSortTB> sortTBList =
					adSortTBMapper.pageQueryByStatusByCityId(new Integer[] { 0 }, limit, 0, cityId);
			List<AttachedScreenAdTB> list = new ArrayList<>(sortTBList.size());
			if (CollectionUtils.isNotEmpty(sortTBList)) {
				for (ScreenAdSortTB sortTB : sortTBList) {
					AttachedScreenAdTB adTB =
							attachedScreenAdTBMapper.selectByPrimaryKey(sortTB.getAdId());
					list.add(adTB);
				}
			}
			resultEntity = new ResultEntity(list);
			resultEntity.setCount(list.size());
		} catch (Exception e) {
			logger.error("数据库查询失败" + ExceptionUtils.getStackTrace(e));
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "广告获取失败");
		}
		return resultEntity;
	}

	/**
	 * 
	 *功 能： 获取广告详情<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月14日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param storeId
	 *@param cityId
	 *@param limit
	 *@return
	 *@throws ServiceException	ResultEntity
	 */
	public ResultEntity getScreenAdDetail(Integer adId) throws ServiceException {
		AttachedScreenAdTB adTB = attachedScreenAdTBMapper.selectByPrimaryKey(adId);
		return new ResultEntity(adTB);
	}

	/**
	 * 
	 *功 能：广告编辑 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月14日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param bean
	 *@return
	 *@throws ServiceException	ResultEntity
	 */
	public ResultEntity editAd(ModifyAttachedScreenBean modifyBean) throws ServiceException {
		ResultEntity resultEntity = new ResultEntity();
		try {
			if (modifyBean != null) {
				String[] cityIds = new String[] {};
				Date nowTime = new Date();
				AttachedScreenAdTB tb = new AttachedScreenAdTB();
				tb.setAllCity(modifyBean.getAllCity());
				if (modifyBean.getAllCity() != 0) {
					if (StringUtils.isNotBlank(modifyBean.getCityIds())) {
						tb.setCityIds(modifyBean.getCityIds());
						cityIds = modifyBean.getCityIds().split(",");
						List<String> cityNameList = citiesTBMapper.queryCityNames(cityIds);
						if (CollectionUtils.isNotEmpty(cityNameList)) {
							for (int i = 0; i < cityNameList.size(); i++) {
								String cityName = cityNameList.get(i);
								if (cityName.equals("市辖区")) {
									cityName = citiesTBMapper.queryDadaCityNameById(
											Integer.valueOf(cityIds[i])) + "市";
									cityNameList.set(i, cityName);
								}
								if (cityName.equals("县")) {
									cityName = citiesTBMapper.queryDadaCityNameById(
											Integer.valueOf(cityIds[i])) + "县";
									cityNameList.set(i, cityName);
								}
							}

						}
						String cityNames = Arrays.toString(cityNameList.toArray(new String[0]));
						tb.setCityNames(cityNames.substring(1, cityNames.length() - 1));
					} else {
						tb.setCityIds("");
						tb.setCityNames("");
					}
				} else {
					tb.setCityIds("");
					tb.setCityNames("");
				}
				tb.setContent(modifyBean.getContent());
				// 开始时间
				DateTime startTime =
						new DateTime(DateUtils.getDateByStr(modifyBean.getStartDate()));
				// 结束时间
				DateTime endTime = new DateTime(DateUtils.getDateByStr(modifyBean.getEndDate()));
				tb.setStartDate(startTime.withTimeAtStartOfDay().toDate());// 日期的0点
				tb.setEndDate(endTime.plusDays(1).plusSeconds(-1).toDate());// 日期的23：59：59
				tb.setImage1(modifyBean.getImage1());
				tb.setImage2(modifyBean.getImage2());
				tb.setStatus(modifyBean.getStatus());
				tb.setTitle(modifyBean.getTitle());
				tb.setType(modifyBean.getType());

				if (DateUtils.isSameDay(tb.getStartDate(), nowTime) || startTime
						.isBefore(DateTime.now().withTimeAtStartOfDay().toDate().getTime())) {
					tb.setStatus(0);
				}
				// 编辑
				if (endTime.isBefore(DateTime.now().withTimeAtStartOfDay().toDate().getTime())) {
					tb.setStatus(3);
				}
				tb.setUpdateTime(nowTime);
				if (modifyBean.getId() != null) {
					tb.setSort(modifyBean.getSort());
					tb.setId(modifyBean.getId());
					attachedScreenAdTBMapper.updateByPrimaryKeySelective(tb);
				} else {// 更新
					tb.setCreateTime(nowTime);
					attachedScreenAdTBMapper.insertSelective(tb);
					tb.setSort(tb.getId());
					attachedScreenAdTBMapper.updateByPrimaryKeySelective(tb);
				}

				// 每次的修改，删除排序表内的广告排序，进行重新排序
				ScreenAdSortTB deleteTB = new ScreenAdSortTB();
				deleteTB.setAdId(tb.getId());
				int delete = adSortTBMapper.delete(deleteTB);
				logger.info("共删除" + delete + "个城市排序");
				// 更新排序表
				List<Integer> quertOpenCityIds = citiesTBMapper.quertOpenCityIds();
				if (modifyBean.getAllCity() != 0) {// 部分城市
					if (cityIds.length != 0) {
						for (int i = 0; i < cityIds.length; i++) {
							Integer cityId = Integer.valueOf(cityIds[i]);
							String cityName = citiesTBMapper.queryCityNameById(cityId);
							if (cityName.equals("市辖区")) {
								cityName = citiesTBMapper.queryDadaCityNameById(cityId) + "市";
							} else if (cityName.equals("县")) {
								cityName = citiesTBMapper.queryDadaCityNameById(cityId) + "县";
							}
							ScreenAdSortTB sortTB = new ScreenAdSortTB();
							sortTB.setAdId(tb.getId());
							sortTB.setStatus(tb.getStatus());
							sortTB.setCityId(cityId);
							sortTB.setCityName(cityName);
							adSortTBMapper.insertSelective(sortTB);
							sortTB.setSort(sortTB.getId());
							adSortTBMapper.updateByPrimaryKeySelective(sortTB);
						}
					}
				} else {// 全部城市插入排序表
					for (Integer cityId : quertOpenCityIds) {
						String cityName = citiesTBMapper.queryCityNameById(cityId);
						if (cityName.equals("市辖区")) {
							cityName = citiesTBMapper.queryDadaCityNameById(cityId) + "市";
						} else if (cityName.equals("县")) {
							cityName = citiesTBMapper.queryDadaCityNameById(cityId) + "县";
						}
						ScreenAdSortTB sortTB = new ScreenAdSortTB();
						sortTB.setAdId(tb.getId());
						sortTB.setStatus(tb.getStatus());
						sortTB.setCityId(cityId);
						sortTB.setCityName(cityName);
						adSortTBMapper.insertSelective(sortTB);
						sortTB.setSort(sortTB.getId());
						adSortTBMapper.updateByPrimaryKeySelective(sortTB);
					}
				}
			}
		} catch (Exception e) {
			logger.error(ExceptionUtils.getStackTrace(e));
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "广告修改失败");
		}
		return resultEntity;
	}

	/**
	 * 
	 *功 能：广告状态修改 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月14日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param bean
	 *@return
	 *@throws ServiceException	ResultEntity
	 */
	public ResultEntity editAdStatus(ModifyAttachedScreenBean modifyBean) throws ServiceException {
		ResultEntity resultEntity = null;
		if (modifyBean != null && modifyBean.getId() != null && modifyBean.getStatus() != null) {
			try {
				attachedScreenAdTBMapper.editStatus(modifyBean.getId(), modifyBean.getStatus());// 修改主表状态
				adSortTBMapper.editStatus(modifyBean.getId(), modifyBean.getStatus());// 修改排序表状态
			} catch (Exception e) {
				logger.error("数据库操作异常：" + ExceptionUtils.getStackTrace(e));
				throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "数据库操作异常！");
			}
			resultEntity = new ResultEntity();
		} else {
			logger.error("信息不全，无法修改广告状态");
			throw new ServiceException(ServiceCode.PARAMETER_CHECKING_ERROR, "信息不全，无法修改广告状态");
		}
		return resultEntity;
	}

	/**
	 * 
	 *功 能：广告排序修改 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月14日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param bean
	 *@return
	 *@throws ServiceException	ResultEntity
	 */
	public ResultEntity editAdSort(Integer id1, Integer id2, Integer sort) throws ServiceException {
		ResultEntity resultEntity = null;
		if (id1 != null && id2 != null && sort != null) {
			try {
				// 交换两个广告的sort
				// 主表排序废弃，启用排序表，id1,id2:排序表id
				adSortTBMapper.editSort(id1, id2, sort);
			} catch (Exception e) {
				logger.error("数据库操作异常：" + ExceptionUtils.getStackTrace(e));
				throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "数据库操作异常！");
			}
			resultEntity = new ResultEntity();
		} else {
			logger.error("信息不全，无法修改广告排序");
			throw new ServiceException(ServiceCode.PARAMETER_CHECKING_ERROR, "信息不全，无法修改广告排序");
		}
		return resultEntity;
	}

	/**
	 * 
	 *功 能： 广告分页查询<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月14日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param searchBean
	 *@return
	 *@throws ServiceException	ResultEntity
	 */
	public ResultEntity listPageAds(AttachedScreenSearchBean searchBean) throws ServiceException {
		ResultEntity resultEntity = null;
		Map<String, Object> map = new HashMap<>();
		try {
			if (searchBean != null && searchBean.getStatus() != null) {
				Integer[] statusArr = null;
				if (searchBean.getStatus() == -1) {// 全部
					statusArr = new Integer[] { 0, 1, 2, 3 };
				} else {
					statusArr = new Integer[] { searchBean.getStatus() };
				}
				Page page = new Page();
				page.setPage(searchBean.getPageIndex());
				page.setRows(searchBean.getPageSize());
				map.put("searchCityId", searchBean.getCityId());
				if (searchBean.getCityId() == 0) {// 全部城市，直接查主表广告
					List<AttachedScreenAdTB> list = new ArrayList<>();
					page.setTotalResult(attachedScreenAdTBMapper.countByStatus(statusArr));
					list = attachedScreenAdTBMapper.pageQueryByStatus(
							statusArr, searchBean.getPageSize(), page.getCurrentResult());
					map.put("list", list);
					map.put("onCount", attachedScreenAdTBMapper.countByStatus(new Integer[] { 0 }));
				} else {// 单独城市，查排序表
					page.setTotalResult(
							attachedScreenAdTBMapper
									.countByStatusAndCityId(statusArr, searchBean.getCityId()));
					// new 新查询排序
					List<ScreenAdSortTB> sortTBList = adSortTBMapper.pageQueryByStatusByCityId(
							statusArr, searchBean.getPageSize(), page.getCurrentResult(),
							searchBean.getCityId());
					List<ScreenAdView> viewList = new ArrayList<>(sortTBList.size());
					if (CollectionUtils.isNotEmpty(sortTBList)) {
						for (ScreenAdSortTB sortTB : sortTBList) {
							AttachedScreenAdTB adTB =
									attachedScreenAdTBMapper.selectByPrimaryKey(sortTB.getAdId());
							ScreenAdView view = new ScreenAdView(sortTB, adTB);
							viewList.add(view);
						}
					}
					map.put("list", viewList);
					map.put(
							"onCount", attachedScreenAdTBMapper.countByStatusAndCityId(
									new Integer[] { 0 }, searchBean.getCityId()));
				}
				map.put("page", page);
			}
		} catch (Exception e) {
			logger.error(ExceptionUtils.getStackTrace(e));
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "广告分页查询失败");
		}
		resultEntity = new ResultEntity(map);
		return resultEntity;
	}

}
