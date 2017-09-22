package com.ddxxsyb.article.http.filter;

import java.lang.reflect.InvocationTargetException;

import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.shengyibao.common.GsonUtil;
import com.syb.api.entity.ResultEntity;
import com.syb.api.entity.ServiceCode;
import com.syb.api.entity.ServiceException;

@ControllerAdvice
public class ExceptionController {

	private static final Logger logger = LoggerFactory.getLogger(ExceptionController.class);

	// 业务自定义异常
	@ExceptionHandler(value = ServiceException.class)
	public void processUnauthenticatedException(
			HttpServletResponse response, ServiceException serviceException) {
		try {
			logger.info("请求服务异常结果：", serviceException);
			printMsg(response, serviceException.getCode(), serviceException.getErrMsg());
		} catch (Exception e) {
			logger.error("ServiceException异常流输出异常：", e);
		}
	}

	// 没找到类异常，请求服务不存在
	@ExceptionHandler(value = ClassNotFoundException.class)
	public void processUnauthenticatedException(
			HttpServletResponse response, ClassNotFoundException classNotFoundException) {
		try {
			logger.error("请求服务不存在异常：", classNotFoundException);
			printMsg(response, ServiceCode.NULL, "该服务不存在");
		} catch (Exception e) {
			logger.error("ClassNotFoundException异常流输出异常：", e);
		}
	}

	// 没找到类异常，请求服务不存在
	@ExceptionHandler(value = NoSuchMethodException.class)
	public void processUnauthenticatedException(
			HttpServletResponse response, NoSuchMethodException noSuchMethodException) {
		try {
			logger.error("请求服务不存在异常：", noSuchMethodException);
			printMsg(response, ServiceCode.NULL, "该服务不存在");
		} catch (Exception e) {
			logger.error("noSuchMethodException异常流输出异常：", e);
		}
	}

	// 没找到类异常，请求服务不存在
	@ExceptionHandler(value = InvocationTargetException.class)
	public void processUnauthenticatedException(
			HttpServletResponse response, InvocationTargetException exception) {
		try {
			logger.error("请求rpc服务不存在异常：", exception);
			printMsg(response, ServiceCode.NULL, "服务正在维护中，请稍后再试");
		} catch (Exception e) {
			logger.error("InvocationTargetException异常流输出异常：", e);
		}
	}

	@ExceptionHandler(value = NoSuchBeanDefinitionException.class)
	public void processUnauthenticatedException(
			HttpServletResponse response, NoSuchBeanDefinitionException noSuchMethodException) {
		try {
			logger.error("请求服务不存在异常：", noSuchMethodException);
			printMsg(response, ServiceCode.NULL, "该服务不存在");
		} catch (Exception e) {
			logger.error("InvocationTargetException异常流输出异常：", e);
		}
	}

	// 请求异常
	@ExceptionHandler(value = HttpMessageNotReadableException.class)
	public void processUnauthenticatedException(
			HttpServletResponse response, HttpMessageNotReadableException classNotFoundException) {
		try {
			logger.error("系统异常：", classNotFoundException);
			printMsg(response, ServiceCode.SYSTEM_EXCEPTION, "请求异常：该服务参数有误");
		} catch (Exception e) {
			logger.error("HttpMessageNotReadableException异常流输出异常：", e);
		}
	}

	// 其他异常
	@ExceptionHandler(value = Exception.class)
	public void processUnauthenticatedException(HttpServletResponse response, Exception exception) {
		try {
			logger.error("请求异常：", exception);
			printMsg(response, ServiceCode.SYSTEM_EXCEPTION, exception.getLocalizedMessage());
		} catch (Exception e) {
			logger.error("Exception异常流输出异常：", e);
		}
	}

	private void printMsg(HttpServletResponse response, Integer errorCode, String errorMsg) {
		try {
			ResultEntity resultEntity = new ResultEntity(errorCode, errorMsg);
			resultEntity.setData(null);
			response.setCharacterEncoding("UTF-8");
			response.getOutputStream().write(GsonUtil.GsonString(resultEntity).getBytes("UTF-8"));
		} catch (Exception e) {
			logger.error("异常流输出异常：", e);
		}
	}

}
