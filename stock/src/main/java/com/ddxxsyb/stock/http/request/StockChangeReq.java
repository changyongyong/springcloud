package com.ddxxsyb.stock.http.request;

import java.io.Serializable;
import java.util.List;

import com.ddxxsyb.stock.dao.view.UpdateGoodInfo;

/**
 * 
 *<li>模块名 : StockChangeReq<br />
 *<li>文件名 : StockChangeReq.java<br />
 *<li>创建时间 : 2017年8月21日<br />
 *<li>实现功能 : 库存变化请求
 *<li><br />作者 : shenyf
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年8月21日 v0.0.1 shenyf 创建<br />
 */
public class StockChangeReq implements Serializable{

	private static final long serialVersionUID = -7178975471189669551L;

	private List<UpdateGoodInfo> orderItems;

	public List<UpdateGoodInfo> getOrderItems() {
		return orderItems;
	}

	public void setOrderItems(List<UpdateGoodInfo> orderItems) {
		this.orderItems = orderItems;
	}

}
