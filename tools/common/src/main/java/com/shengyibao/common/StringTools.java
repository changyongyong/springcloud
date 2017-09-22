package com.shengyibao.common;

import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.RandomStringUtils;

/**
 * 
 *<li>模块名 : StringUtils<br />
 *<li>文件名 : StringUtils.java<br />
 *<li>创建时间 : 2017年8月1日<br />
 *<li>实现功能 : 
 *<li><br />作者 : changyy
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年8月1日 v0.0.1 changyy 创建<br />
 */
public class StringTools {

	public static String getTwelveBit(String no) {
		return String.format("%0" + 8 + "d", Integer.parseInt(no)) + ""
				+ RandomStringUtils.randomNumeric(4);
	}

	public static String signPost(LinkedHashMap<String, String> map, String password) {
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

	public static String signGet(LinkedHashMap<String, String> map, String password) {
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

	public static String map2url(LinkedHashMap<String, String> map) {
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

	public static String encode(String str) {
		str = URLEncoder.encode(str);
		str = str
				.replace("[", "%5B").replace("]", "%5D").replace("(", "%28").replace(")", "%29")
				.replace("+", "%2B").replace("'", "%27").replace("\"", "%22").replace(";", "%3B")
				.replace(">", "%3E").replace(".", "%2E").replace("?", "%3F").replace("/", "%2F")
				.replace("|", "%7C").replace("\\", "%5C").replace("{", "%7B").replace("}", "%7D")
				.replace("#", "%23").replace("$", "%24").replace("^", "%5E").replace("&", "%26")
				.replace("*", "%2A").replace("_", "%5F").replace("+", "%2B").replace("-", "%2D")
				.replace("=", "%3D").replace("~", "%7E").replace("`", "%60 ");
		// .replace("%", "%25")
		return str;
	}

}
