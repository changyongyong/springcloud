package com.syb.api.entity;

public class ServiceException extends RuntimeException {
	/**
	 * 
	 */
	private static final long serialVersionUID = -8148229075902004994L;

	protected String errMsg;

	protected Integer code;

	public ServiceException() {
		super();
	}

	public ServiceException(Integer code, String msgFormat, Object... args) {
		super(String.format(msgFormat, args));
		this.code = code;
		this.errMsg = String.format(msgFormat, args);
	}

	public String getErrMsg() {
		return errMsg;
	}

	public void setErrMsg(String errMsg) {
		this.errMsg = errMsg;
	}

	public Integer getCode() {
		return code;
	}

	public void setCode(Integer code) {
		this.code = code;
	}
}
