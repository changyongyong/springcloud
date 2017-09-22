package com.ddxxsyb.category.http.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.ddxxsyb.category.http.Bean.AddRequestBean;
import com.ddxxsyb.category.http.Bean.ExchangeRequestBean;
import com.ddxxsyb.category.http.Bean.UpdateRequestBean;
import com.ddxxsyb.category.service.CategoryService;
import com.syb.api.entity.ResultEntity;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;


@Api(value="生意宝目录模块服务",description="post请求参数请传json格式")
@RestController
@RequestMapping("/category")
public class CategoryController extends BaseController {

	private static final Logger logger = LoggerFactory.getLogger(CategoryController.class);
	
	@Autowired
	private CategoryService categoryService;
	

	/**
	 * 
	 *功 能：初始化 - 分类 - 店铺首次登录时进行分类预置 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 yuxy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param bean
	 *@return	ResultEntity
	 */
	@ApiOperation(value="初始化 - 分类",notes="店铺首次登录时进行分类预置")
	@ApiImplicitParam(name="storeId",value="店铺id",required=true,dataType="Integer",paramType="path")
	@RequestMapping(value = "/init/{storeId}", method = RequestMethod.GET)
    public ResultEntity init(@PathVariable  Integer storeId) {
		logger.info("进入初始化 - 分类 - 店铺首次登录时进行分类预置: storeId ="+storeId);
		return categoryService.Init(storeId);
    }
	
	/**
	 * 
	 *功 能：删除分类 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 yuxy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param id
	 *@return	ResultEntity
	 */
	@ApiOperation(value="删除分类", notes="删除目录分类")
	@ApiImplicitParams({
		@ApiImplicitParam(name="storeId",value="店铺id",required=true,dataType="Integer",paramType="path"),
		@ApiImplicitParam(name="catelogId",value="分类id",required=true,dataType="String",paramType="path")
		})
	@RequestMapping(value = "/delete/{storeId}/{catelogId}", method = RequestMethod.GET)
    public ResultEntity delete(@PathVariable Integer storeId,@PathVariable  String catelogId) {
		logger.info("进入删除分类: storeId ="+storeId+",catelogId="+catelogId);
		return categoryService.delete(storeId,catelogId);
    }
	

	/**
	 * 
	 *功 能：批量更新 - 分类 - 顺序 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 yuxy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param bean
	 *@return	ResultEntity
	 */
	@ApiOperation(value="批量更新分类顺序")
	@RequestMapping(value = "/exchange", method = RequestMethod.POST)
    public ResultEntity exchange(@RequestBody ExchangeRequestBean exchangeRequestBean  ) {
		String rankJson = exchangeRequestBean.getRankJson();
		Integer storeId=exchangeRequestBean.getStoreId();
		logger.info("进入 批量更新 - 分类 - 顺序  ,rankJson="+rankJson+",storeId="+storeId);
		return categoryService.exchange(rankJson,storeId);
	}
	
	/**
	 * 
	 *功 能：新增 - 分类 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 yuxy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param bean
	 *@return	ResultEntity
	 */
	@ApiOperation(value="新增分类")
	@RequestMapping(value = "/add", method = RequestMethod.POST)
    public ResultEntity add(@RequestBody AddRequestBean addRequestBean ) {
		logger.info("进入 新增 - 分类  ,addRequestBean="+addRequestBean);
		return categoryService.add(addRequestBean);
	}
	
	
	/**
	 * 
	 *功 能：更新 - 分类名称、打包费 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 yuxy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param bean
	 *@return	ResultEntity
	 */
	@ApiOperation(value="更新分类", notes="更新分类名称，打包费")
	@RequestMapping(value = "/update", method = RequestMethod.POST)
    public ResultEntity category( @RequestBody UpdateRequestBean updateRequestBean) {
		logger.info("进入 更新 - 分类名称、打包费  ,updateRequestBean："+updateRequestBean);
		return categoryService.update(updateRequestBean);
	}
	
	
	/**
	 * 
	 *功 能：获取 - 分类列表 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 yuxy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param bean
	 *@return	ResultEntity
	 */
	@ApiOperation(value="获取分类列表")
	@ApiImplicitParam(name="storeId",value="店铺id",required=true,dataType="Integer",paramType="path")
	@RequestMapping(value = "/queryCategory/{storeId}", method = RequestMethod.GET)
    public ResultEntity queryCategory(@PathVariable  Integer storeId  ) {
		logger.info("进入获取 - 分类列表,storeId="+storeId);
		return categoryService.queryCategory(storeId);
	}
	
	/**
	 * 
	 *功 能： 格式化 - 分类 - 排序<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 yuxy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@return	ResultEntity
	 */
	@ApiOperation(value="格式化 - 分类 - 排序")
	@ApiImplicitParam(name="storeId",value="店铺id",required=true,dataType="Integer",paramType="path")
	@RequestMapping(value = "/reorder/{storeId}", method = RequestMethod.GET)
    public ResultEntity reorderCatalog( @PathVariable  Integer storeId  ) {
		logger.info("进入格式化 - 分类 - 排序,storeId="+storeId);
		return categoryService.reorderCatalog(storeId);
	}
	
}
