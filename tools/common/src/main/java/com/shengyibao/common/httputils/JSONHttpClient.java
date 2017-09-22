package com.shengyibao.common.httputils;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.http.HttpException;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.CoreConnectionPNames;
import org.apache.http.util.EntityUtils;

public class JSONHttpClient {

	// 接口地址
	private String apiURL;
	private HttpClient httpClient = null;
	private int status = 0;

	/**
	 * 接口地址
	 * 
	 * @param url
	 * @throws URISyntaxException
	 */
	public JSONHttpClient(String url) throws URISyntaxException {
		if (url != null) {
			this.apiURL = url;
		}
		if (apiURL != null) {
			httpClient = new DefaultHttpClient();
			httpClient.getParams().setParameter(CoreConnectionPNames.CONNECTION_TIMEOUT, 40000);
			httpClient.getParams().setParameter(CoreConnectionPNames.SO_TIMEOUT, 40000);
		}
	}

	/**
	 * 调用 API
	 * 
	 * @param parameters
	 * @return
	 * @throws HttpException
	 * @throws URISyntaxException
	 */
	public String post(String parameters, String token) throws HttpException, URISyntaxException {
		String body = null;

		if (parameters != null && !"".equals(parameters.trim())) {
			try {
				HttpPost method = new HttpPost(apiURL);
				// 建立一个NameValuePair数组，用于存储欲传送的参数
				method.addHeader("Content-type", "application/json; charset=utf-8");
				method.setHeader("Accept", "application/json");
				method.setHeader("Authorization", token);
				method.setEntity(new StringEntity(parameters, "utf-8"));

				HttpResponse response = httpClient.execute(method);

				int statusCode = response.getStatusLine().getStatusCode();

				if (statusCode != HttpStatus.SC_OK) {
					status = 1;
				}
				body = EntityUtils.toString(response.getEntity(), "utf-8");

			} catch (IOException e) {
				// 网络错误
				status = 3;
			} finally {
			}
		}
		return body;
	}

	/**
	 * 调用 API post返回流
	 * 
	 * @param parameters
	 * @return
	 * @throws HttpException
	 * @throws URISyntaxException
	 */
	public HttpResponse postRes(String parameters, String token)
			throws HttpException, URISyntaxException {

		if (parameters != null && !"".equals(parameters.trim())) {
			try {
				HttpPost method = new HttpPost(apiURL);
				// 建立一个NameValuePair数组，用于存储欲传送的参数
				method.addHeader("Content-type", "application/json; charset=utf-8");
				method.setHeader("Accept", "application/json");
				method.setHeader("Authorization", token);
				method.setEntity(new StringEntity(parameters, "utf-8"));

				HttpResponse response = httpClient.execute(method);

				int statusCode = response.getStatusLine().getStatusCode();

				if (statusCode != HttpStatus.SC_OK) {
					status = 1;
				}
				return response;
			} catch (IOException e) {
				// 网络错误
				status = 3;
			} finally {
			}
		}
		return null;

	}

	/**
	 * 
	 *功 能： 专为加token令牌请求重写<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月31日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param parameters
	 *@param token
	 *@return
	 *@throws HttpException
	 *@throws URISyntaxException	String
	 */
	public String postParametersForToken(Map<String, String> parameters, String token)
			throws HttpException, URISyntaxException {
		String body = null;

		if (MapUtils.isNotEmpty(parameters)) {
			try {
				HttpPost method = new HttpPost(apiURL);
				method.setHeader("Authorization", token);
				// 建立一个NameValuePair数组，用于存储欲传送的参数
				List<NameValuePair> params = new ArrayList<NameValuePair>();
				for (String key : parameters.keySet()) {
					params.add(new BasicNameValuePair(key, parameters.get(key)));
				}

				method.setEntity(new UrlEncodedFormEntity(params, "utf-8"));
				HttpResponse response = httpClient.execute(method);

				int statusCode = response.getStatusLine().getStatusCode();

				if (statusCode != HttpStatus.SC_OK) {
					status = 1;
				}
				body = EntityUtils.toString(response.getEntity());

			} catch (IOException e) {
				// 网络错误
				status = 3;
			} finally {
			}
		}
		return body;
	}

	/**
	 * 
	 *功 能：post请求 form表单参数方式<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月31日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param parameters
	 *@return
	 *@throws HttpException
	 *@throws URISyntaxException	String
	 */
	public String postParameters(Map<String, String> parameters)
			throws HttpException, URISyntaxException {
		String body = null;

		if (MapUtils.isNotEmpty(parameters)) {
			try {
				HttpPost method = new HttpPost(apiURL);
				// 建立一个NameValuePair数组，用于存储欲传送的参数
				List<NameValuePair> params = new ArrayList<NameValuePair>();
				for (String key : parameters.keySet()) {
					params.add(new BasicNameValuePair(key, parameters.get(key)));
				}

				method.setEntity(new UrlEncodedFormEntity(params, "utf-8"));
				HttpResponse response = httpClient.execute(method);

				int statusCode = response.getStatusLine().getStatusCode();

				if (statusCode != HttpStatus.SC_OK) {
					status = 1;
				}
				body = EntityUtils.toString(response.getEntity());

			} catch (IOException e) {
				// 网络错误
				status = 3;
			} finally {
			}
		}
		return body;
	}

	/**
	 * 
	 *功 能： get请求，参数即请求url ?后边的数据<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月31日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param parameters
	 *@return
	 *@throws HttpException
	 *@throws URISyntaxException	String
	 */
	public String get(String parameters) throws HttpException, URISyntaxException {
		String body = null;

		if (parameters != null && !"".equals(parameters.trim())) {
			try {
				HttpGet method = new HttpGet(apiURL + "?" + parameters);
				// 建立一个NameValuePair数组，用于存储欲传送的参数
				method.addHeader("Content-type", "application/json; charset=utf-8");
				method.setHeader("Accept", "application/json");

				HttpResponse response = httpClient.execute(method);

				int statusCode = response.getStatusLine().getStatusCode();

				if (statusCode != HttpStatus.SC_OK) {
					status = 1;
				}
				body = EntityUtils.toString(response.getEntity());

			} catch (IOException e) {
				// 网络错误
				status = 3;
			} finally {
			}
		}
		return body;
	}

	/**
	 * 
	 *功 能： get请求返回流，参数即请求url ?后边的数据<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月31日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param parameters
	 *@return
	 *@throws HttpException
	 *@throws URISyntaxException	String
	 */
	public HttpResponse getRes(String parameters) throws HttpException, URISyntaxException {

		if (parameters != null && !"".equals(parameters.trim())) {
			try {
				HttpGet method = new HttpGet(apiURL + "?" + parameters);
				// 建立一个NameValuePair数组，用于存储欲传送的参数
				method.addHeader("Content-type", "application/json; charset=utf-8");
				method.setHeader("Accept", "application/json");

				HttpResponse response = httpClient.execute(method);

				int statusCode = response.getStatusLine().getStatusCode();

				if (statusCode != HttpStatus.SC_OK) {
					status = 1;
				}
				return response;
			} catch (IOException e) {
				// 网络错误
				status = 3;
			} finally {
			}
		}
		return null;
	}

	/**
	 * 0.成功 1.执行方法失败 2.协议错误 3.网络错误
	 * 
	 * @return the status
	 */
	public int getStatus() {
		return status;
	}

	/**
	 * @param status the status to set
	 */
	public void setStatus(int status) {
		this.status = status;
	}
}
