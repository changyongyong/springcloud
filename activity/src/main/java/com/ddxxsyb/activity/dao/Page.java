package com.ddxxsyb.activity.dao;

import java.io.Serializable;

public class Page implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 7560941499252494029L;

	/**
	 * 总页数
	 */
	private int totalPage; //
	/**
	 * 总行数
	 */
	private int totalResult; //
	/**
	 * 当前记录起始索引
	 */
	private int currentResult; //
	/**
	 * true:需要分页的地方，传入的参数就是Page实体；false:需要分页的地方，传入的参数所代表的实体拥有Page属性
	 */
	private boolean entityOrField; //

	/**
	 * 当前页
	 */
	private int page;//
	/**
	 * 每页显示记录数
	 */
	private int rows = 100;//

	public Page() {
	}

	public Page(int page, int rows) {
		this.page = page;
		this.rows = rows;
	}

	public int getTotalPage() {
		if (totalResult % rows == 0)
			totalPage = totalResult / rows;
		else
			totalPage = totalResult / rows + 1;
		return totalPage;
	}

	public void setTotalPage(int totalPage) {
		this.totalPage = totalPage;
	}

	public int getTotalResult() {
		return totalResult;
	}

	public void setTotalResult(int totalResult) {
		this.totalResult = totalResult;
	}

	public int getCurrentResult() {
		currentResult = (getPage() - 1) * getRows();
		if (currentResult < 0)
			currentResult = 0;
		return currentResult;
	}

	public void setCurrentResult(int currentResult) {
		this.currentResult = currentResult;
	}

	public boolean isEntityOrField() {
		return entityOrField;
	}

	public void setEntityOrField(boolean entityOrField) {
		this.entityOrField = entityOrField;
	}

	public int getPage() {
		if (page <= 0)
			page = 1;
		// 本来超过最大页数就取最大页数，因为前端使用list中是否为空判断是否为最后一页，所以这里去掉
		// if (page > getTotalPage())
		// page = getTotalPage();
		return page;
	}

	public void setPage(int page) {
		this.page = page;
	}

	public int getRows() {
		return rows;
	}

	public void setRows(int rows) {
		this.rows = rows;
	}

}
