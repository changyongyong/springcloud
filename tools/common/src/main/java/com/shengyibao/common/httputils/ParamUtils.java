package com.shengyibao.common.httputils;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

/**
 * httpclient
 * @author wzy 2017.3.16
 *
 */
public class ParamUtils {

	public static String decoder(String s){
		String decoder = null;
		try {
			decoder = URLDecoder.decode(s, "utf-8");
		} catch (UnsupportedEncodingException e) {
			System.out.println(e.getMessage());
		}
		return decoder;

	}

	public static String encode(String s){
		String encoder = null;
		try {
			encoder = URLEncoder.encode(s, "utf-8");
		} catch (UnsupportedEncodingException e) {
			System.out.println(e.getMessage());
		}
		return encoder;
	}

	public static Map<String, String> queryToMap(String query){
		Map<String, String> result = new HashMap<String,String>();
		String[] pairs = query.split("&");
		if (pairs != null && pairs.length > 0) {
			for (String pair : pairs) {
				String[] param = pair.split("=", 2);
				if (param != null && param.length == 2) {
					result.put(param[0], param[1]);
				}
			}
		}
		return result;
	}

	public static String mapToQuery(Map<String, String> queryMap){
		StringBuffer query = new StringBuffer();
		boolean have = false;
		Iterator<Entry<String, String>> queryIterator = queryMap.entrySet().iterator();
		for (;queryIterator.hasNext();) {
			Entry<String, String> nameVal = queryIterator.next();
			String name = nameVal.getKey();
			String value  = nameVal.getValue();
			if (notEmpty(name, value)) {
				if (have) {
					query.append("&");
				}else{
					have = true;
				}
				query.append(nameVal.getKey()).append("=").append(nameVal.getValue());
			}
		}
		return query.toString();
	}

	public static boolean notEmpty(String ...values){
		boolean result = true;
		if (values == null || values.length == 0) {
			result = false;
		} else {
			for (String value : values) {
				result &= !((null==value)||("".equals(value))?true:false);
			}
		}
		return result;
	}
}