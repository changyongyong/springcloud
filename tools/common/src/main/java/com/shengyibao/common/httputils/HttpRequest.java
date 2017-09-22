package com.shengyibao.common.httputils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.DeleteMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.PutMethod;

/**
 * httpclient
 * @author  wzy 2017.3.16
 *
 */
public class HttpRequest {
	private HttpClient httpClient = new HttpClient();
	// 参数对
	private List<NameValuePair> valuePairs = new ArrayList<NameValuePair>();
	// 头
	private List<Header> headers = new ArrayList<Header>();

	/**
	 * 名-值对组装参数
	 * @param name
	 * @param value
	 * @return
	 */
	public HttpRequest addParam(String name, String value) {
		this.valuePairs.add(new NameValuePair(name, value));
		return this;
	}

	/**
	 * 查询字符串组装参数
	 * @param queryString
	 * @return
	 */
	public HttpRequest addParam(String queryString) {
		if (ParamUtils.notEmpty(queryString)) {
			Map<String, String> queryMap = ParamUtils.queryToMap(queryString);
			Set<Entry<String, String>> querySet = queryMap.entrySet();
			for (Entry<String, String> nameVal : querySet) {
				this.addParam(nameVal.getKey(), nameVal.getValue());
			}
		}
		return this;
	}

	/**
	 * 组装头部参数
	 * @param name
	 * @param value
	 * @return
	 */
	public HttpRequest addHeader(String name, String value) {
		this.headers.add(new Header(name, value));
		return this;
	}

	/**
	 * post请求
	 * @param url
	 * @return
	 */
	public String post(String url) {
		PostMethod pm = new PostMethod(url);
		if (this.valuePairs.size() > 0) {
			pm.addParameters(this.valuePairs.toArray(new NameValuePair[this.valuePairs.size()]));
		}
		if (this.headers.size() > 0) {
			for (Header header : this.headers) {
				pm.addRequestHeader(header);
			}
		}
		try {
			httpClient.executeMethod(pm);
			return pm.getResponseBodyAsString();
		} catch (Exception e) {

		}
		return "";
	}

	/**
	 * get请求
	 * @param url
	 * @return
	 */
	public String get(String url) {
		GetMethod gm = new GetMethod(url);
		if (this.headers.size() > 0) {
			for (Header header : this.headers) {
				gm.addRequestHeader(header);
			}
		}
		gm.setQueryString(this.valuePairs.toArray(new NameValuePair[this.valuePairs.size()]));
		try {
			httpClient.executeMethod(gm);
			return gm.getResponseBodyAsString();
		} catch (Exception e) {

		}
		return "";
	}

	/**
	 * delete请求
	 * @param url
	 * @return
	 */
	public String delete(String url) {
		DeleteMethod gm = new DeleteMethod(url);
		if (this.headers.size() > 0) {
			for (Header header : this.headers) {
				gm.addRequestHeader(header);
			}
		}
		gm.setQueryString(this.valuePairs.toArray(new NameValuePair[this.valuePairs.size()]));
		try {
			httpClient.executeMethod(gm);
			return gm.getResponseBodyAsString();
		} catch (Exception e) {

		}
		return "";
	}

	/**
	 * put请求
	 * @param url
	 * @return
	 */
	public String put(String url) {
		PutMethod gm = new PutMethod(url);
		if (this.headers.size() > 0) {
			for (Header header : this.headers) {
				gm.addRequestHeader(header);
			}
		}
		gm.setQueryString(this.valuePairs.toArray(new NameValuePair[this.valuePairs.size()]));
		try {
			httpClient.executeMethod(gm);
			return gm.getResponseBodyAsString();
		} catch (Exception e) {

		}
		return "";
	}
}
