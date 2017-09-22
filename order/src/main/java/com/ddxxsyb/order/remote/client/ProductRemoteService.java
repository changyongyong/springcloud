package com.ddxxsyb.order.remote.client;

import org.springframework.cloud.netflix.feign.FeignClient;

/**
 * 
 *<li>模块名 : ProductRemoteService<br />
 *<li>文件名 : ProductRemoteService.java<br />
 *<li>创建时间 : 2017年8月22日<br />
 *<li>实现功能 : 调取产品服务相关的接口
 *<li><br />作者 : 常勇
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年8月22日 v0.0.1 常勇 创建<br />
 */
@FeignClient(name = "service-product")
public interface ProductRemoteService {

}
