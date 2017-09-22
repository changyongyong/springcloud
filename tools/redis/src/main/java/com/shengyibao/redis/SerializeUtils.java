package com.shengyibao.redis;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.nio.charset.Charset;

import org.apache.commons.lang3.SerializationException;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * 
 *<li>模块名 : SerializeUtils<br />
 *<li>文件名 : SerializeUtils.java<br />
 *<li>创建时间 : 2017年5月8日<br />
 *<li>实现功能 : redis序列化工具
 *<li><br />作者 : changyy
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年5月8日 v0.0.1 changyy 创建<br />
 */
public class SerializeUtils {

	private static final Logger logger = LogManager.getLogger(SerializeUtils.class);

	public static final String EMPTY_JSON = "{}";

	public static final Charset DEFAULT_CHARSET = Charset.forName("UTF-8");

	protected ObjectMapper objectMapper = new ObjectMapper();

	public SerializeUtils() {

	}

	/**
	 * java-object as json-string
	 * @param object
	 * @return
	 */
	public String seriazileAsString(Object object) {
		if (object == null) {
			return EMPTY_JSON;
		}
		try {
			return this.objectMapper.writeValueAsString(object);
		} catch (Exception ex) {
			throw new SerializationException("Could not write JSON: " + ex.getMessage(), ex);
		}
	}

	/**
	 * json-string to java-object
	 * @param str
	 * @return
	 */
	public <T> T deserializeAsObject(String str, Class<T> clazz) {
		if (str == null || clazz == null) {
			return null;
		}
		try {
			return this.objectMapper.readValue(str, clazz);
		} catch (Exception ex) {
			throw new SerializationException("Could not write JSON: " + ex.getMessage(), ex);
		}
	}

	/**
	 * 序列化
	 * 
	 * @param object
	 * @return
	 * @throws Exception
	 */
	public static byte[] serialize(Object object) throws Exception {
		if (object == null)
			return null;
		ObjectOutputStream oos = null;
		ByteArrayOutputStream baos = null;
		try {
			// 序列化
			baos = new ByteArrayOutputStream();
			oos = new ObjectOutputStream(baos);
			oos.writeObject(object);
			byte[] bytes = baos.toByteArray();
			return bytes;
		} catch (Exception e) {
			logger.error(ExceptionUtils.getStackTrace(e));
			throw e;
		}
	}

	/**
	 * 反序列化
	 * 
	 * @param bytes
	 * @return
	 * @throws Exception
	 */
	public static Object unSerialize(byte[] bytes) throws Exception {
		if (bytes == null)
			return null;
		ByteArrayInputStream bais = null;
		try {
			// 反序列化
			bais = new ByteArrayInputStream(bytes);
			ObjectInputStream ois = new ObjectInputStream(bais);
			return ois.readObject();
		} catch (Exception e) {
			logger.error(ExceptionUtils.getStackTrace(e));
			throw e;
		}
	}

}
