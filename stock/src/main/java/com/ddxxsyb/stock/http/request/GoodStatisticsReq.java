package com.ddxxsyb.stock.http.request;

import java.io.Serializable;

public class GoodStatisticsReq implements Serializable {

	private static final long serialVersionUID = 7258363989602926798L;
	/**
	 *@param cid 分类编号 全部为-1
	 *@param dir 变动类型 all为全部，in为入库，out为出库
	 *@param end 结束日期 后端补全"23:59:59"
	 *@param keyword 查询关键词；商品名称或条码
	 *@param limit 偏移量
	 *@param offset 起始量
	 *@param start 	起始日期 后端补全"00:00:00"
	 */
	
	private String cid;
	private String dir;
	private String end;
	private String keyword;
	private Integer limit;
	private Integer offset;
	private String start;
	private Integer storeId;

	public String getCid() {
		return cid;
	}

	public void setCid(String cid) {
		this.cid = cid;
	}

	public String getDir() {
		return dir;
	}

	public void setDir(String dir) {
		this.dir = dir;
	}

	public String getEnd() {
		return end;
	}

	public void setEnd(String end) {
		this.end = end;
	}

	public String getKeyword() {
		return keyword;
	}

	public void setKeyword(String keyword) {
		this.keyword = keyword;
	}

	public Integer getLimit() {
		return limit;
	}

	public void setLimit(Integer limit) {
		this.limit = limit;
	}

	public Integer getOffset() {
		return offset;
	}

	public void setOffset(Integer offset) {
		this.offset = offset;
	}

	public String getStart() {
		return start;
	}

	public void setStart(String start) {
		this.start = start;
	}

	public Integer getStoreId() {
		return storeId;
	}

	public void setStoreId(Integer storeId) {
		this.storeId = storeId;
	}

}
