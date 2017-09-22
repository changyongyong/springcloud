package com.ddxxsyb.category.http.feign;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import com.ddxxsyb.category.http.feign.fallback.ProductRemoteServiceHystric;
import com.syb.api.entity.ResultEntity;

@FeignClient(value = "service-product",fallback=ProductRemoteServiceHystric.class)
public interface ProductRemoteService {

	 @RequestMapping(value = "/v3/product/moveProducts",method = RequestMethod.GET)
	  ResultEntity moveProducts(@RequestParam("cidBy")  String cidBy ,@RequestParam("cidTo")  String cidTo );

}
