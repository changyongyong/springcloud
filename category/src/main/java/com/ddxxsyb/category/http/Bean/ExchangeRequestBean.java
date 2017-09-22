package com.ddxxsyb.category.http.Bean;

import java.io.Serializable;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * 
 *<li>模块名 : AddRequestBean<br />
 *<li>文件名 : AddRequestBean.java<br />
 *<li>创建时间 : 2017年8月23日<br />
 *<li>实现功能 : 更新目录顺序请求封装类
 *<li><br />作者 : yuxy
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年8月23日 v0.0.1 yuxy 创建<br />
 */
@ApiModel(value="更新目录顺序请求封装类" )
public class ExchangeRequestBean implements Serializable {

	private static final long serialVersionUID = 1L;
	
	@ApiModelProperty(name="storeId",value="店铺id",required=true,dataType="Integer")
	private Integer storeId;  //店铺id
	
	@ApiModelProperty(name="rankJson",value="（分类号：序号） 键值对json串",example="{\"b7bf08914c41471da3deb014ea5b15eb\":1,\"066aa3a0572b4d73a02aa58626f7402b\":2}",required=true,dataType="String")
	private String  rankJson; //

	@Override
	public String toString() {
		return "ExchangeRequestBean [storeId=" + storeId + ", rankJson=" + rankJson + "]";
	}

	public Integer getStoreId() {
		return storeId;
	}

	public void setStoreId(Integer storeId) {
		this.storeId = storeId;
	}

	public String getRankJson() {
		return rankJson;
	}

	public void setRankJson(String rankJson) {
		this.rankJson = rankJson;
	}
	
	
	
	
	
	


	
	
	
}
