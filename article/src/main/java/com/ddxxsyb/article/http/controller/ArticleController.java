package com.ddxxsyb.article.http.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ddxxsyb.article.dao.bean.AttachedScreenSearchBean;
import com.ddxxsyb.article.dao.bean.ModifyAttachedScreenBean;
import com.ddxxsyb.article.service.AdService;
import com.syb.api.entity.ResultEntity;
import com.syb.api.entity.ServiceException;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;

@Api(value = "article")
@RestController
@RequestMapping("/article")
public class ArticleController extends BaseController {

	@Autowired
	private AdService adService;

	/**
	 * 
	 *功 能：获取店铺广告 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月24日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param limit
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/ads/show", method = RequestMethod.GET)
	@ApiOperation(value = "获取店铺广告 ", httpMethod = "GET", notes = "获取店铺广告 ",
			response = ResultEntity.class)
	@ApiImplicitParam(name = "limit", value = "展示广告数", required = false, dataType = "int",
			paramType = "query")
	public ResultEntity ads(@RequestParam(name = "limit", required = false) Integer limit) {
		return adService.getScreenAds(getStoreId(), getCityId(), limit != null ? limit : 10);
	}

	/**
	 * 
	 *功 能： 获取广告详情<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月24日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param adId
	 *@return
	 *@throws ServiceException	ResultEntity
	 */
	@RequestMapping(value = "/ads/detail", method = RequestMethod.GET)
	@ApiOperation(value = "获取广告详情", httpMethod = "GET", notes = "获取广告详情",
			response = ResultEntity.class)
	@ApiImplicitParam(name = "adId", value = "广告ID", required = true, dataType = "int",
			paramType = "query")
	public ResultEntity getScreenAdDetail(
			@RequestParam(name = "adId", required = true) Integer adId)
			throws ServiceException {
		return adService.getScreenAdDetail(adId);
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
	@RequestMapping(value = "/ads/edit", method = RequestMethod.POST)
	@ApiOperation(value = "广告编辑 ", httpMethod = "POST", notes = "广告编辑 ",
			response = ResultEntity.class)
	public ResultEntity editAd(@RequestBody ModifyAttachedScreenBean modifyBean) {
		return adService.editAd(modifyBean);
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
	@RequestMapping(value = "/ads/editStatus", method = RequestMethod.POST)
	@ApiOperation(value = "广告状态修改 ", httpMethod = "POST", notes = "广告状态修改 ",
			response = ResultEntity.class)
	public ResultEntity editAdStatus(@RequestBody ModifyAttachedScreenBean modifyBean) {
		return adService.editAdStatus(modifyBean);
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
	@RequestMapping(value = "/ads/editSort", method = RequestMethod.GET)
	@ApiOperation(value = "广告排序修改", httpMethod = "GET", notes = "广告排序修改",
			response = ResultEntity.class)
	@ApiImplicitParams({
			@ApiImplicitParam(name = "id1", value = "广告1ID", required = true, dataType = "int",
					paramType = "query"),
			@ApiImplicitParam(name = "id2", value = "广告2ID", required = true, dataType = "int",
					paramType = "query"),
			@ApiImplicitParam(name = "sort", value = "广告1排序", required = true, dataType = "int",
					paramType = "query") })
	public ResultEntity editAdSort(
			@RequestParam(name = "id1", required = true) Integer id1,
			@RequestParam(name = "id2", required = true) Integer id2,
			@RequestParam(name = "sort", required = true) Integer sort) {
		return adService.editAdSort(id1, id2, sort);
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
	@RequestMapping(value = "/ads/listPage", method = RequestMethod.POST)
	@ApiOperation(value = " 广告分页查询", httpMethod = "POST", notes = " 广告分页查询",
			response = ResultEntity.class)
	public ResultEntity listPageAds(@RequestBody AttachedScreenSearchBean searchBean) {
		return adService.listPageAds(searchBean);
	}
}
