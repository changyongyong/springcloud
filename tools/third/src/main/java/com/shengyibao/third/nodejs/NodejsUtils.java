package com.shengyibao.third.nodejs;

import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONObject;
import com.shengyibao.common.GsonUtil;
import com.shengyibao.common.MD5Util;
import com.shengyibao.common.StringUtils;
import com.shengyibao.common.UUIDUtils;
import com.shengyibao.common.httputils.JSONHttpClient;
import com.syb.api.entity.ServiceException;

public class NodejsUtils {

	private static final Logger logger = LoggerFactory.getLogger(NodejsUtils.class);

	/**
	 * 
	 *功 能： <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月2日 v0.0.1 liuhx 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param map 请求参数
	 *@param storeId 店铺ID
	 *@param accountNo 账户编号
	 *@param diandaNodejsAccountId 账户id
	 *@param diandaNodejsPassword key
	 *@param diandaNodejsDdpayUrl 请求地址(包括uri)
	 *@return
	 *@throws ServiceException	JSONObject
	 */
	public static JSONObject getDdpayService(
			LinkedHashMap<String, String> map, Integer storeId, String diandaNodejsAccountId,
			String diandaNodejsPassword, String diandaNodejsDdpayUrl)
			throws ServiceException {
		map.put("onceStr", UUIDUtils.getRandomUUID());
		map.put("timestamp", "" + System.currentTimeMillis() / 1000);
		map.put("accountId", diandaNodejsAccountId);
		String prepare = "";
		try {
			prepare = map2url(map) + "&sign=" + signGet(map, diandaNodejsPassword);
		} catch (Exception e) {
			logger.info("店铺：" + storeId + "加密异常", e);
			throw new ServiceException(500, "店铺：" + storeId + "加密异常");
		}

		String response = null;
		try {
			response = new JSONHttpClient(diandaNodejsDdpayUrl).get(prepare);
			logger.info("请求nodejs服务器查询绑定账号接口--" + diandaNodejsDdpayUrl + ",响应------->" + response);
		} catch (Exception e) {
			logger.error("请求nodejs服务器查询绑定账号接口异常--" + diandaNodejsDdpayUrl, e);
			throw new ServiceException(500, "系统异常");
		}
		JSONObject jsonObject = JSONObject.parseObject(response);
		if (StringUtils.isNotBlank(response)) {

			if ("error".equals(jsonObject.get("tag"))) {
				throw new ServiceException(500, jsonObject.get("message").toString());
			}

			if (jsonObject.getJSONArray("data") == null
					|| jsonObject.getJSONArray("data").size() == 0) {
				logger.info("请求后返回的data中为空！" + GsonUtil.GsonString(jsonObject));
				throw new ServiceException(500, "系统异常");
			}

		} else {
			logger.error("调取nodejs查询异常--" + diandaNodejsDdpayUrl + response);
			throw new ServiceException(500, "调取nodejs查询异常");
		}

		logger.info("请求get服务result----------->" + jsonObject);
		return jsonObject;
	}

	/**
	 * 
	 *功 能： <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年8月2日 v0.0.1 liuhx 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param map 请求参数
	 *@param storeId 店铺ID
	 *@param accountNo 账户编号
	 *@param diandaNodejsAccountId 账户id
	 *@param diandaNodejsPassword key
	 *@param diandaNodejsDdpayUrl 请求地址(包括uri)
	 *@return
	 *@throws ServiceException	JSONObject
	 */
	public static JSONObject postDdpayService(
			LinkedHashMap<String, String> map, Integer storeId, String diandaNodejsAccountId,
			String diandaNodejsPassword, String diandaNodejsDdpayUrl)
			throws ServiceException {

		map.put("onceStr", UUIDUtils.getRandomUUID());
		map.put("timestamp", "" + System.currentTimeMillis() / 1000);
		map.put("accountId", diandaNodejsAccountId);
		map.put("sign", signPost(map, diandaNodejsPassword));

		String response = null;
		try {
			response = new JSONHttpClient(diandaNodejsDdpayUrl).postParameters(map);
			logger.info("请求nodejs服务器查询绑定账号接口--" + diandaNodejsDdpayUrl + ",响应------->" + response);
		} catch (Exception e) {
			logger.error("请求nodejs服务器查询绑定账号接口异常--" + diandaNodejsDdpayUrl, e);
			throw new ServiceException(500, "系统异常");
		}
		JSONObject jsonObject = JSONObject.parseObject(response);
		if (StringUtils.isNotBlank(response)) {

			if ("error".equals(jsonObject.get("tag"))) {
				throw new ServiceException(500, jsonObject.get("message").toString());
			}

			if (jsonObject.getJSONArray("data") == null
					|| jsonObject.getJSONArray("data").size() == 0) {
				logger.info("请求后返回的data中为空！" + GsonUtil.GsonString(jsonObject));
				throw new ServiceException(500, "系统异常");
			}

		} else {
			logger.error("调取nodejs查询异常--" + diandaNodejsDdpayUrl + response);
			throw new ServiceException(500, "调取nodejs查询异常");
		}

		logger.info("请求post服务result----------->" + jsonObject);
		return jsonObject;
	}

	private static String signPost(LinkedHashMap<String, String> map, String password) {
		try {
			// 将map转成list
			List<Map.Entry<String, String>> infos =
					new ArrayList<Map.Entry<String, String>>(map.entrySet());
			// 对list排序,实现新的比较器
			Collections.sort(infos, new Comparator<Map.Entry<String, String>>() {
				@Override
				public int compare(Map.Entry<String, String> o1, Map.Entry<String, String> o2) {
					return o1.getKey().compareTo(o2.getKey());
				}
			});
			// 申明新的有序 map,根据放入的数序排序
			Map<String, String> lhm = new LinkedHashMap<String, String>();
			// 遍历比较过后的map,将结果放到LinkedHashMap
			for (Map.Entry<String, String> entry : infos) {
				lhm.put(entry.getKey(), encode(entry.getValue()));
			}
			StringBuffer sb = new StringBuffer();
			for (String key : lhm.keySet()) {
				if (sb.length() != 0) {
					sb.append("&");
				}
				sb.append(key);
				sb.append("=");
				sb.append(lhm.get(key));
			}

			return MD5Util.md5Encode(sb.toString() + "&key=" + password);
		} catch (Exception e) {
		}
		return "";
	}

	private static String signGet(LinkedHashMap<String, String> map, String password) {
		try {
			// 将map转成list
			List<Map.Entry<String, String>> infos =
					new ArrayList<Map.Entry<String, String>>(map.entrySet());
			// 对list排序,实现新的比较器
			Collections.sort(infos, new Comparator<Map.Entry<String, String>>() {
				@Override
				public int compare(Map.Entry<String, String> o1, Map.Entry<String, String> o2) {
					return o1.getKey().compareTo(o2.getKey());
				}
			});
			// 申明新的有序 map,根据放入的数序排序
			Map<String, String> lhm = new LinkedHashMap<String, String>();
			// 遍历比较过后的map,将结果放到LinkedHashMap
			for (Map.Entry<String, String> entry : infos) {
				lhm.put(entry.getKey(), encode(entry.getValue()));
			}
			StringBuffer sb = new StringBuffer();
			for (String key : lhm.keySet()) {
				if (sb.length() != 0) {
					sb.append("&");
				}
				sb.append(key);
				sb.append("=");
				sb.append(lhm.get(key));
			}

			return MD5Util.md5Encode(sb.toString() + "&key=" + password);
		} catch (Exception e) {
		}
		return "";
	}

	private static String map2url(LinkedHashMap<String, String> map) {
		try {
			StringBuffer sb = new StringBuffer();
			for (String key : map.keySet()) {
				if (sb.length() != 0) {
					sb.append("&");
				}
				sb.append(key);
				sb.append("=");
				sb.append(map.get(key));
			}

			return sb.toString();
		} catch (Exception e) {
		}
		return "";
	}

	private static String encode(String str) {
		str = URLEncoder.encode(str);
		str = str
				.replace("[", "%5B").replace("]", "%5D").replace("(", "%28").replace(")", "%29")
				.replace("+", "%2B").replace("'", "%27").replace("\"", "%22").replace(";", "%3B")
				.replace(">", "%3E").replace(".", "%2E").replace("?", "%3F").replace("/", "%2F")
				.replace("|", "%7C").replace("\\", "%5C").replace("{", "%7B").replace("}", "%7D")
				.replace("#", "%23").replace("$", "%24").replace("^", "%5E").replace("&", "%26")
				.replace("*", "%2A").replace("_", "%5F").replace("+", "%2B").replace("-", "%2D")
				.replace("=", "%3D").replace("~", "%7E").replace("`", "%60 ");
		return str;
	}

}
