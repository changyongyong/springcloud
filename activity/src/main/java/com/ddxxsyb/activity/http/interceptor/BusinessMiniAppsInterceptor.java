package com.ddxxsyb.activity.http.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.shengyibao.common.httputils.JWTUtil;
import com.syb.api.entity.ServiceException;

import io.jsonwebtoken.Claims;

public class BusinessMiniAppsInterceptor implements HandlerInterceptor {

	private static final Logger logger = LoggerFactory.getLogger(BusinessMiniAppsInterceptor.class);

	@Override
	public boolean preHandle(
			HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		// 1、先获取令牌
		// 测试数据：放到head中：Authorization:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTAyNTY2LCJwaG9uZSI6MTg5MTIzNjcwMjksImNpdHlJZCI6bnVsbCwidGltZXN0YW1wIjoxNDkyMTU5MTU1NDg1fQ.n785x4dMu2Bp4DEpgk9gRdqPh-vGryBfXxEPCQsPdEk
		String tokenid = request.getHeader("Authorization");// 登录账户身份
		logger.info("tokenid:" + tokenid);
		// 2、校验令牌是否为空，为空抛出令牌验证非法异常
		if (StringUtils.isBlank(tokenid)) {
			logger.error("请求Token为空:" + tokenid);
			throw new ServiceException(90090005, "请求Token为空");
		}
		// 3、令牌不为空，解析令牌，解析结果为空，抛出令牌校验非法异常
		Claims claims = JWTUtil.parseJWT(tokenid);
		if (claims == null) {
			logger.error("解析令牌为空，tokenid:" + tokenid);
			throw new ServiceException(90090005, "请求Token解析失败：" + tokenid);
		}
		String storeid = claims.get("store_id").toString();
		if (StringUtils.isBlank(storeid)) {
			logger.error("storeid：" + storeid);
			throw new ServiceException(90090005, "请求Token解析获取店铺id失败：" + storeid);
		}
		request.setAttribute("userInfo", claims);
		return true;
	}

	@Override
	public void postHandle(
			HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView)
			throws Exception {
	}

	@Override
	public void afterCompletion(
			HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
	}

	public static void main(String[] args) throws Exception {
		String s =
				"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdG9yZV9pZCI6IjE0NTYxNSIsInRpdGxlIjoi6I2J6I6T6I2J6I6T6I2J6I6TIiwidXNlciI6IuWwj-iNieiOkyIsInBob25lIjoxNTA3Nzc3Nzc3NywidGltZXN0YW1wIjoxNDk1ODYyNjMzODM0fQ.Q-A0d2jth5cOjOHAh0ctsqDB-KnsC2YrNTAhaZJ9Plg";
		Claims parseJWT = JWTUtil.parseJWT(s);
		System.err.println(parseJWT);
	}
}
