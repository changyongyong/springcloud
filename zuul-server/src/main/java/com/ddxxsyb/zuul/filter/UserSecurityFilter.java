package com.ddxxsyb.zuul.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.netflix.zuul.ZuulFilter;

public class UserSecurityFilter extends ZuulFilter {

	private static Logger log = LoggerFactory.getLogger(UserSecurityFilter.class);

	@Override
	public boolean shouldFilter() {
		log.info("================shouldFilter=================");
		return true;
	}

	@Override
	public Object run() {
		log.info("=================run================");
		return null;
	}

	// pre：可以在请求被路由之前调用
	// route：在路由请求时候被调用
	// post：在route和error过滤器之后被调用
	// error：处理请求时发生错误时被调用
	@Override
	public String filterType() {
		log.info("=================filterType================");
		return "pre";
	}

	@Override
	public int filterOrder() {
		log.info("=================filterOrder================");
		return 0;// 优先级为0，数字越大，优先级越低
	}

}
