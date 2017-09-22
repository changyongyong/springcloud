package com.ddxxsyb.category.http.feign.fallback;

import org.springframework.stereotype.Component;

import com.ddxxsyb.category.http.feign.ProductRemoteService;
import com.syb.api.entity.ResultEntity;
import com.syb.api.entity.ServiceCode;

@Component
public class ProductRemoteServiceHystric implements ProductRemoteService {

	@Override
	public ResultEntity moveProducts(String cidBy, String cidTo) {
		return new ResultEntity(ServiceCode.SYSTEM_SERVICE_EXCEPTION, "调用商品服务异常");
	}

}
