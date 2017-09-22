package com.ddxxsyb.stock.remote;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.ddxxsyb.stock.remote.request.EditBspStockReq;
import com.syb.api.entity.ResultEntity;

/**
 * 
 *<li>模块名 : ProductRemoteService<br />
 *<li>文件名 : ProductRemoteService.java<br />
 *<li>创建时间 : 2017年8月21日<br />
 *<li>实现功能 : 商品模块远程调用
 *<li><br />作者 : shenyf
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年8月21日 v0.0.1 shenyf 创建<br />
 */
@FeignClient(name = "service-product")
public interface ProductRemoteService {
	
	/**
	 * 
	 *功 能： 修改商品库存量<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param editBspStockReq
	 *@return	ResultEntity
	 */
	@RequestMapping(value = "/product/editBspStock", method = RequestMethod.POST)
	ResultEntity editBspStock(@RequestBody EditBspStockReq editBspStockReq);
}