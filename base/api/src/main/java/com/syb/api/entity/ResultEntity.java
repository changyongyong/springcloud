package com.syb.api.entity;

import java.io.Serializable;

public class ResultEntity implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String message = "success";
	private Integer statusCode = ServiceCode.SUCCESS;
	private Object data = null; // 需要传递的数据
	private Integer count = 0; // 数量

	public ResultEntity() {
	}

	public ResultEntity(Integer statusCode, String message) {
		this.statusCode = statusCode;
		this.message = message;
	}

	public ResultEntity(Object data) {
		this.data = data;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public Integer getStatusCode() {
		return statusCode;
	}

	public void setStatusCode(Integer statusCode) {
		this.statusCode = statusCode;
	}

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}

	public Integer getCount() {
		return count;
	}

	public void setCount(Integer count) {
		this.count = count;
	}

	@Override
	public String toString() {
		return "ResultEntity [message=" + message + ", statusCode=" + statusCode + ", data=" + data + ", count=" + count
				+ "]";
	}
	
	
}
