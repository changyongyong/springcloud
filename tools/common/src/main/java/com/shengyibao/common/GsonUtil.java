package com.shengyibao.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;

/**
 * json转换工具类
 *
 * @author wujj
 */
public class GsonUtil {
	private static Gson gson = null;

	static {
		if (gson == null) {
			gson = new Gson();
		}
	}

	private GsonUtil() {
	}

	/**
	 * 将object对象转成json字符串
	 * 
	 * @param object
	 * @return
	 */
	public static String GsonString(Object object) {
		String gsonString = null;
		if (gson != null) {
			gsonString = gson.toJson(object);
		}
		return gsonString;
	}

	/**
	 * 将gsonString转成泛型bean
	 * 
	 * @param gsonString
	 * @param cls
	 * @return
	 */
	public static <T> T GsonToBean(String gsonString, Class<T> cls) {
		T t = null;
		if (gson != null) {
			t = gson.fromJson(gsonString, cls);
		}
		return t;
	}

	/**
	 * 转成list 泛型在编译期类型被擦除导致报错
	 * 
	 * @param gsonString
	 * @param cls
	 * @return
	 */
	public static <T> List<T> GsonToList(String gsonString, Class<T> cls) {
		List<T> list = null;
		if (gson != null) {
			list = gson.fromJson(gsonString, new TypeToken<List<T>>() {
			}.getType());
		}
		return list;
	}

	/**
	 * 转成list 解决泛型问题
	 * 
	 * @param json
	 * @param cls
	 * @param <T>
	 * @return
	 */
	public static <T> List<T> jsonToList(String json, Class<T> cls) {
		Gson gson = new Gson();
		List<T> list = new ArrayList<T>();
		JsonArray array = new JsonParser().parse(json).getAsJsonArray();
		for (final JsonElement elem : array) {
			list.add(gson.fromJson(elem, cls));
		}
		return list;
	}

	/**
	 * 转成list中有map的
	 * 
	 * @param gsonString
	 * @return
	 */
	public static <T> List<Map<String, T>> GsonToListMaps(String gsonString) {
		List<Map<String, T>> list = null;
		if (gson != null) {
			list = gson.fromJson(gsonString, new TypeToken<List<Map<String, T>>>() {
			}.getType());
		}
		return list;
	}

	/**
	 * 转成map的
	 * 
	 * @param gsonString
	 * @return
	 */
	public static <T> Map<String, T> GsonToMaps(String gsonString) {
		Map<String, T> map = null;
		if (gson != null) {
			map = gson.fromJson(gsonString, new TypeToken<Map<String, T>>() {
			}.getType());
		}
		return map;
	}

	public static Map<String, String> GsonStrToMaps(String gsonString) {
		Map<String, String> map = null;
		if (gson != null) {
			map = gson.fromJson(gsonString, new TypeToken<Map<String, String>>() {
			}.getType());
		}
		return map;
	}

	/**
	 * 
	 *功 能：对象转map类型 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年4月15日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param object
	 *@return	Map<String,T>
	 */
	public static <T> Map<String, T> ObjectToMaps(Object object) {
		Map<String, T> map = new HashMap<String, T>();
		if (object != null) {
			map = gson.fromJson(gson.toJson(object), new TypeToken<Map<String, T>>() {
			}.getType());
		}
		return map;
	}

	/**
	 * 
	 *功 能： string --> map<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年7月25日 v0.0.1 sunjy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param mapString
	 *@return	Map
	 */
	public static Map<String, String> GsonToMapsV2(String gsonString) {
		Map<String, String> map = null;
		if (gson != null) {
			map = gson.fromJson(gsonString, new TypeToken<Map<String, String>>() {
			}.getType());
		}
		return map;
	} 
}
