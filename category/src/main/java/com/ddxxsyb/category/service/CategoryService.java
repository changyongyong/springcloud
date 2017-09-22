package com.ddxxsyb.category.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;


import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ddxxsyb.category.dao.mapper.BStoreProductCatelogsMapper;
import com.ddxxsyb.category.dao.mapper.BaseCatalogMapper;
import com.ddxxsyb.category.dao.pojo.BStoreProductCatalog;
import com.ddxxsyb.category.dao.pojo.BaseCatalog;
import com.ddxxsyb.category.http.Bean.AddRequestBean;
import com.ddxxsyb.category.http.Bean.ResponseBean;
import com.ddxxsyb.category.http.Bean.UpdateRequestBean;
import com.ddxxsyb.category.http.feign.ProductRemoteService;
import com.shengyibao.common.GsonUtil;
import com.shengyibao.common.UUIDUtils;
import com.syb.api.entity.ResultEntity;
import com.syb.api.entity.ServiceCode;
import com.syb.api.entity.ServiceException;

@Service
@Transactional
public class CategoryService {
	
	private static final Logger logger =LoggerFactory.getLogger(CategoryService.class);
	
	@Autowired
	private  ProductRemoteService productService;
	
	@Autowired
	private BStoreProductCatelogsMapper bStoreProductCatelogsMapper;

	@Autowired
	private BaseCatalogMapper baseCatalogMapper;
	
	/**
	 * 
	 *功 能：初始化 - 分类 - 店铺首次登录时进行分类预置 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 yuxy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param storeId
	 *@return	ResultEntity
	 */
	public ResultEntity Init(Integer storeId) throws ServiceException {
		logger.info("进入 初始化 - 分类 - 店铺首次登录时进行分类预置 storeId " +storeId);
		if(null ==storeId || storeId <=0) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"未查询到本门店，请联系客服");
		}
		BStoreProductCatalog category = new BStoreProductCatalog();
		category.setBspcStoreId(storeId);
		List<BStoreProductCatalog> categorylist = bStoreProductCatelogsMapper.select(category);
		if (null != categorylist && categorylist.size() > 0) {
			return new ResultEntity(ServiceCode.SYSTEM_SERVICE_EXCEPTION, "该店铺下已有分类");
		}
		// 创建分类
		List<BaseCatalog> baseCatalogList = baseCatalogMapper.selectAll();
		// 创建默认分类
		BStoreProductCatalog categoryDefult = new BStoreProductCatalog();
		categoryDefult.setBspcCatalogId(String.valueOf(storeId) + "000000");
		categoryDefult.setBspcCatalogName("默认");
		categoryDefult.setBspcSequence(baseCatalogList.size());
		categoryDefult.setBspcStoreId(storeId);
		categoryDefult.setBspcFlag(1);
		categoryDefult.setBspcPackage(BigDecimal.ZERO);
		categoryDefult.setBspcCreatedAt(new Date());
		categoryDefult.setBspcUpdatedAt(new Date());
		int i = bStoreProductCatelogsMapper.insert(categoryDefult);
		if(i <1) {
			logger.error("创建默认分类 失败" + storeId);
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "初始化失败");
		}
		int m = 0;
		
		for (BaseCatalog baseCatalog : baseCatalogList) { 
			BStoreProductCatalog categoryNew = new BStoreProductCatalog();
			categoryNew.setBspcCatalogId(UUIDUtils.getUUID());
			categoryNew.setBspcCatalogName(baseCatalog.getBcTitle());
			categoryNew.setBspcSequence(m);
			categoryNew.setBspcStoreId(storeId);
			categoryNew.setBspcFlag(1);
			categoryNew.setBspcPackage(BigDecimal.ZERO);
			categoryNew.setBspcCreatedAt(new Date());
			categoryNew.setBspcUpdatedAt(new Date());
			m++;
			
			int k = bStoreProductCatelogsMapper.insert(categoryNew);
			if (k < 1) {
				logger.error("初始化分类失败"+storeId);
				throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "初始化失败");
			}
		}
		logger.info(" 初始化 - 分类 - 店铺首次登录时进行分类预置  成功 storeId" +storeId);
		return new ResultEntity(ServiceCode.SUCCESS, "初始化成功");
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
	public ResultEntity delete(Integer storeId, String catelogId) throws ServiceException {
		logger.info("进入删除分类: storeId ="+storeId+",catelogId="+catelogId);
		if(null ==storeId || storeId <=0) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"未查询到本门店，请联系客服");
		}
		if(StringUtils.isBlank(catelogId)) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"参数传入有误");
		}
		if ((storeId + "000000").equals(catelogId)) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR, "默认分类不允许删除");
		}
		// 判断是否有该分类
		BStoreProductCatalog category = new BStoreProductCatalog();
		category.setBspcStoreId(storeId);
		category.setBspcCatalogId(catelogId);
		try {
			category = bStoreProductCatelogsMapper.selectOne(category);
		} catch (Exception e) {
			logger.error("查询要删除的分类"+catelogId+"出错" + e );
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "查询要删除的分类"+catelogId+"出错");
		}
		if (null == category) {
			return new ResultEntity(ServiceCode.NULL, "未查询到该分类");
		}
		// 将该分类下的商品移到默认分类下
		// --查询默认分类的主键
		BStoreProductCatalog categoryDefult = new BStoreProductCatalog();
		categoryDefult.setBspcStoreId(storeId);
		categoryDefult.setBspcCatalogId(storeId+"000000");
		try {
			categoryDefult = bStoreProductCatelogsMapper.selectOne(categoryDefult);
		} catch (Exception e) {
			logger.error("查询默认分类出错" + e );
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION,"业务数据出错，请联系客服");
		}
//		BStoreProduct bStoreProduct=new BStoreProduct();
//		bStoreProduct.setBspCatalogId(id);
//		List<BStoreProduct> bStoreProductList= bStoreProductMapper.select(bStoreProduct);
//		int n=bStoreProductList.size();
//		int m=0;
//		for(BStoreProduct bStoreProductBean : bStoreProductList) {
//			bStoreProductBean.setBspCatalogId(categoryDefult.getBspcCatalogId());
//			bStoreProductBean.setBsp_updatedAt(new Date());
//			int j= bStoreProductMapper.updateByPrimaryKeySelective(bStoreProductBean);
//			m++;
//			if( j<1) {
//				throw new ServiceException(300, "数据操作失败");
//			}
//		}
//		Map<String,Integer> map=new HashMap<String,Integer>();
//		map.put("total", n);
//		map.put("update", m);
		
		// feign 调用商品服务  参数  catelogId  categoryDefult.getBspcCatalogId()
		
		ResultEntity response = productService.moveProducts(catelogId, categoryDefult.getBspcCatalogId());
		logger.info("调用商品服务：response"+response);
		if(response.getStatusCode().intValue()!=ServiceCode.SUCCESS.intValue()) {
			return new ResultEntity(ServiceCode.SYSTEM_SERVICE_EXCEPTION, "调用商品服务，迁移商品分类出错 ");
		}
		category.setBspcFlag(-1);
		category.setBspcUpdatedAt(new Date());
		int i = bStoreProductCatelogsMapper.updateByPrimaryKeySelective(category);
		if (i < 1) {
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "数据操作失败，请联系客服");
		}
		//高位序列减一
		List<BStoreProductCatalog> catalogList=bStoreProductCatelogsMapper.selectBStoreProductCatalogThanSequence(storeId,category.getBspcSequence());
		for( BStoreProductCatalog entity : catalogList) {
			entity.setBspcSequence(entity.getBspcSequence()-1);
			entity.setBspcUpdatedAt(new Date());
			int j=bStoreProductCatelogsMapper.updateByPrimaryKeySelective(entity);
			if(j <1) {
				throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "数据操作失败");
			}
		}
		logger.info("删除分类成功"+catelogId);
		ResultEntity result=new ResultEntity(ServiceCode.SUCCESS, "删除分类成功");
		result.setData(response.getData());
		logger.info("返回结果："+result);
		return result;
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
	 *@param rankJson
	 *@param storeId
	 *@return	ResultEntity
	 */
	public ResultEntity exchange(String rankJson, Integer storeId) throws ServiceException {
		logger.info("进入 批量更新 - 分类 - 顺序  ,rankJson="+rankJson+",storeId="+storeId);
 		if(null ==rankJson) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"传入数据为空");
		}
 		Map<String,Double> map=GsonUtil.GsonToMaps(rankJson);
		if(null==map || map.size() <1) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"传入数据为空");
		}
		if(null == storeId) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"未查询到本门店，请联系客服");
		}
		for (Map.Entry<String, Double> entry : map.entrySet()) {
			BStoreProductCatalog bStoreProductCategory = new BStoreProductCatalog();
			bStoreProductCategory.setBspcStoreId(storeId);
			bStoreProductCategory.setBspcCatalogId(entry.getKey());
			bStoreProductCategory = bStoreProductCatelogsMapper.selectOne(bStoreProductCategory);
			if (null == bStoreProductCategory) {
				return new ResultEntity(ServiceCode.NULL, "未查询到该目录");
			}
			Integer value;
			try {
				value = Integer.parseInt((entry.getValue()+"").replaceAll(".0", ""));
			} catch (NumberFormatException e) {
				logger.error("转换序列值异常" +e.getMessage());
				throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "转换序列值异常,可联系客服");
			}
			bStoreProductCategory.setBspcSequence(value);
			bStoreProductCategory.setBspcUpdatedAt(new Date());
			int i = bStoreProductCatelogsMapper.updateByPrimaryKeySelective(bStoreProductCategory);
			if (i < 1) {
				throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "批量更新分类排序号失败");
			}

		}
		logger.info(" 批量更新 - 分类 - 顺序  结束" +storeId);
		return new ResultEntity(ServiceCode.SUCCESS, "排序成功");
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
	 *@param rankJson
	 *@param storeId
	 *@return	ResultEntity
	 */
	public ResultEntity add(AddRequestBean bean) throws ServiceException{
		logger.info("进入 新增 - 分类  bean"+bean);
		String name=bean.getName();
		Double pkSum= bean.getPkSum();
		Integer sort=bean.getSort();
		Integer storeId =bean.getStoreId();
		if(null == storeId) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"未查询到本门店，请联系客服");
		}
		if(null==pkSum) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"未获取到打包费");
		}
		if(StringUtils.isBlank(name)) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"未获取到分类名称");
		}
		if(null ==sort) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"未未获取到排序序号");
		}
		//分类不得超过50个
		BStoreProductCatalog bStoreProductCategoryAll = new BStoreProductCatalog();
		bStoreProductCategoryAll.setBspcStoreId(storeId);
		int count=bStoreProductCatelogsMapper.selectBStoreProductCatalogByStoreId(storeId);
		if(count >= 50){
			return new ResultEntity(ServiceCode.SYSTEM_SERVICE_EXCEPTION,"分类不得超过50个");
		}
		// 校验是否存在此分类
		BStoreProductCatalog bStoreProductCategory = new BStoreProductCatalog();
		bStoreProductCategory.setBspcStoreId(storeId);
		bStoreProductCategory.setBspcCatalogName(name);
		bStoreProductCategory.setBspcFlag(1);
		bStoreProductCategory = bStoreProductCatelogsMapper.selectOne(bStoreProductCategory);
		if (null != bStoreProductCategory) {
			return new ResultEntity(ServiceCode.SYSTEM_SERVICE_EXCEPTION, "已存在此分类");
		}
		// 创建此分类--修改默认分类
		BStoreProductCatalog bStoreProductCategory1 = new BStoreProductCatalog();
		bStoreProductCategory1.setBspcCatalogId(storeId + "" + "000000");
		bStoreProductCategory1 = bStoreProductCatelogsMapper.selectOne(bStoreProductCategory1);
		if (null == bStoreProductCategory1) {
			return new ResultEntity(ServiceCode.NULL, "此店铺不存在默认分类，请联系客服");
		}
		bStoreProductCategory1.setBspcSequence(sort + 1);
		bStoreProductCategory1.setBspcUpdatedAt(new Date());
		int i = bStoreProductCatelogsMapper.updateByPrimaryKeySelective(bStoreProductCategory1);
		if (i < 1) {
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "修改默认分类序号失败");
		}
		BStoreProductCatalog bStoreProductCategory2 = new BStoreProductCatalog();
		if(bean.getCatelogId()!=null) {
			bStoreProductCategory2.setBspcCatalogId(bean.getCatelogId());
		}else {
			bStoreProductCategory2.setBspcCatalogId(UUIDUtils.getRandomUUID());
		}
		bStoreProductCategory2.setBspcStoreId(storeId);
		bStoreProductCategory2.setBspcCatalogName(name);
		bStoreProductCategory2.setBspcPackage(new BigDecimal(pkSum));
		bStoreProductCategory2.setBspcSequence(sort);
		bStoreProductCategory2.setBspcFlag(1);
		bStoreProductCategory2.setBspcCreatedAt(new Date());
		bStoreProductCategory2.setBspcUpdatedAt(new Date());
		int j = bStoreProductCatelogsMapper.insert(bStoreProductCategory2);
		String cid=bStoreProductCategory2.getBspcCatalogId();
		if (j < 1) {
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "创建分类失败");
		}
		logger.info(" 新增 - 分类 service 结束"+storeId);
		ResultEntity result=new ResultEntity(ServiceCode.SUCCESS, "创建分类成功");
		result.setData(cid);
		logger.info("返回结果："+result);
		return result;
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
	 *@param form
	 *@return	ResultEntity
	 */
	public ResultEntity update(UpdateRequestBean bean)  throws ServiceException{
		logger.info("进入  更新分类名称、打包费  bean"+bean);
		String name=bean.getName();
		Double pkSum= bean.getPkSum();
		Integer storeId =bean.getStoreId();
		String cid = bean.getCatelogId();
		if(null == storeId) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"未查询到本门店，请联系客服");
		}
		if(null ==pkSum) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"打包费为空");
		}
		if(StringUtils.isBlank(cid)) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"未获取需要修改的分类编号");
		}
		if((storeId+"000000").equals(name)) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"默认分类不允许修改");
		}
		
		BStoreProductCatalog bStoreProductCategory = new BStoreProductCatalog();
		//bStoreProductCategory.setBspcStoreId(storeId);
		bStoreProductCategory.setBspcCatalogId(cid);
		bStoreProductCategory = bStoreProductCatelogsMapper.selectOne(bStoreProductCategory);
		if (null == bStoreProductCategory) {
			return new ResultEntity(ServiceCode.NULL, "未查询到该分类");
		}
		//是否已存在此分类
		if(StringUtils.isNotBlank(name)) {
			BStoreProductCatalog bStoreProductCategory1 = new BStoreProductCatalog();
			bStoreProductCategory1.setBspcStoreId(storeId);
			bStoreProductCategory1.setBspcCatalogName(name);
			bStoreProductCategory1.setBspcFlag(1);
			bStoreProductCategory1 = bStoreProductCatelogsMapper.selectOne(bStoreProductCategory1);
			if (null != bStoreProductCategory1) {
				return new ResultEntity(ServiceCode.SYSTEM_SERVICE_EXCEPTION, "编辑分类失败,已存在该名称的分类");
			}
		}
		bStoreProductCategory.setBspcPackage(new BigDecimal(pkSum.toString()));
		if(StringUtils.isNotBlank(name)) {
			bStoreProductCategory.setBspcCatalogName(name);
		}
		bStoreProductCategory.setBspcUpdatedAt(new Date());
		int i = bStoreProductCatelogsMapper.updateByPrimaryKeySelective(bStoreProductCategory);
		if (i < 1) {
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "编辑分类失败");
		}
		logger.info(" 更新分类名称、打包费 service 结束");
		return new ResultEntity(ServiceCode.SUCCESS, "编辑分类成功");
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
	public ResultEntity queryCategory(Integer storeId)  throws ServiceException{
		logger.info("进入 获取 - 分类列表  storeId:"+storeId);
		if(null == storeId) {
			return new ResultEntity(ServiceCode.SYSTEM_EXCEPTION,"未查询到本门店，请联系客服");
		}
	
		
		List<ResponseBean> list = new ArrayList<ResponseBean>();
		try {
			List<BStoreProductCatalog> bStoreProductCategoryList =bStoreProductCatelogsMapper.queryCatalog(storeId);
			for (BStoreProductCatalog bStoreProductCatalog : bStoreProductCategoryList) {
				list.add(new ResponseBean(bStoreProductCatalog));
			}
		} catch (Exception e) {
			logger.error("查询目录列表出错" +e.getMessage());
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "查询失败");
		}
		logger.info("获取 - 分类列表  结束："+list);
		ResultEntity result = new ResultEntity(ServiceCode.SUCCESS, "查询成功");
		result.setData(list);
		logger.info("返回结果："+result);
		return result;
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
	public ResultEntity reorderCatalog(Integer storeId) {
		logger.info("进入 格式化 - 分类 - 排序 service");
		if(null == storeId) {
			return new ResultEntity(ServiceCode.PARAMETER_CHECKING_ERROR,"未查询到本门店，请联系客服");
		}
		//1.格式化 - 分类 - 排序
		int t=format(storeId);
		if(t <1) {
			throw new ServiceException(300,"格式化 - 分类 - 排序 失败");
		}
		
		//2.查询分类列表
		List<ResponseBean> list = new ArrayList<ResponseBean>();
		try {
			List<BStoreProductCatalog> bStoreProductCategoryList =bStoreProductCatelogsMapper.queryCatalog(storeId);
			for (BStoreProductCatalog bStoreProductCatalog : bStoreProductCategoryList) {
				list.add(new ResponseBean(bStoreProductCatalog));
			}
		} catch (Exception e) {
			logger.error("查询目录列表出错" +e.getMessage());
			throw new ServiceException(ServiceCode.SYSTEM_EXCEPTION, "查询失败");
		}
		logger.info("格式化 - 分类 - 排序 service 结束");
		ResultEntity result = new ResultEntity(ServiceCode.SUCCESS, "格式化成功");
		result.setData(list);
		logger.info("返回结果："+result);
		return result;
	}

	public int format(Integer storeId) {
		BStoreProductCatalog bStoreProductCatalogAll=new BStoreProductCatalog();
		bStoreProductCatalogAll.setBspcStoreId(storeId);
		List<BStoreProductCatalog> list=bStoreProductCatelogsMapper.queryCatalog(storeId);
		int m=list.size();
		int n=0;
		for(BStoreProductCatalog entity:list) {
			if((storeId+"000000").equals(entity.getBspcCatalogId())) {
				entity.setBspcSequence(m-1);
				entity.setBspcUpdatedAt(new Date());
				int i=bStoreProductCatelogsMapper.updateByPrimaryKeySelective(entity);
				if(i <1) {
					return 0;
				}
			}else {
				entity.setBspcSequence(n);
				entity.setBspcUpdatedAt(new Date());
				n++;
				int i=bStoreProductCatelogsMapper.updateByPrimaryKeySelective(entity);
				if(i <1) {
					return 0;
				}
			}
		}
		return 1;
	}

	

	

	
}
