package com.ddxxsyb.article.http.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import io.jsonwebtoken.Claims;

public class BaseController implements ApplicationContextAware {
	
	@Autowired
	protected HttpServletRequest request; // 这里可以获取到request

	protected ApplicationContext applicationContext;

	protected Integer getStoreId() {
		Claims userInfo = (Claims) request.getAttribute("userInfo");
		Integer storeId = Integer.valueOf(userInfo.get("store_id").toString());
		return storeId;
	}
	
	protected Integer getCityId() {
		Claims userInfo = (Claims) request.getAttribute("userInfo");
		Integer cityId = userInfo.get("cityId") != null
				? Integer.valueOf(userInfo.get("cityId").toString()) : null;
		return cityId;
	}
	/**
	 * 
	 *功 能：获取ioc加载了的bean <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月5日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param id ioc中的bean的id参数
	 *@return	Object 返回的ioc实例化的bean
	 */
	public Object getBean(String id) {
		return applicationContext.getBean(id);
	}

	@Override
	public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
		this.applicationContext = applicationContext;
	}
}
