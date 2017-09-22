package com.shengyibao.redis;

import redis.clients.jedis.Jedis;

/**
 * 
 *<li>模块名 : JedisClient<br />
 *<li>文件名 : JedisClient.java<br />
 *<li>创建时间 : 2017年5月8日<br />
 *<li>实现功能 : 操作redis工具类
 *<li><br />作者 : changyy
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年5月8日 v0.0.1 changyy 创建<br />
 */
public interface JedisClient {

	/**
	 * 
	 *功 能： 查询key是否在redis中存在<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key
	 *@return	Boolean
	 */
	public Boolean exists(Object key);

	/**
	 * 
	 *功 能： <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key 字符串
	 *@return	Boolean
	 */
	public Boolean exists(String key);

	/**
	 * 
	 *功 能：redis中插入对象 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key  对象类型，必须支持序列化，实现序列化接口Serializable
	 *@param value 对象类型，必须支持序列化，实现序列化接口Serializable
	 *@param cacheSeconds 缓存期限为cacheSeconds 单位：秒
	 *@return	String
	 */
	public String setExpire(Object key, Object value, int cacheSeconds);

	/**
	 * 
	 *功 能：有期限数据存储 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月11日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key  字符串
	 *@param value 对象类型，必须支持序列化，实现序列化接口Serializable
	 *@param cacheSeconds 缓存期限为cacheSeconds 单位：秒
	 *@return	String
	 */
	public String setExpire(String key, Object value, int cacheSeconds);

	/**
	 * 
	 *功 能： <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key 字符串
	 *@param value
	 *@param cacheSeconds 缓存期限为cacheSeconds 单位：秒
	 *@return	String
	 */
	public String setExpire(String key, String value, int cacheSeconds);

	/**
	 * 
	 *功 能：存储永久数据 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key
	 *@param value
	 *@return	String
	 */
	public String set(Object key, Object value);

	/**
	 * 
	 *功 能： 存储永久数据<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月11日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key  字符串
	 *@param value 对象类型，必须支持序列化，实现序列化接口Serializable
	 *@return	String
	 */
	public String set(String key, Object value);

	/**
	 * 
	 *功 能： <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key 字符串
	 *@param value
	 *@return	String
	 */
	public String set(String key, String value);

	/**
	 * 
	 *功 能：从java中获取数据 刷新expire时间<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key
	 *@return	Object
	 */
	public Object get(Object key);

	/**
	 * 
	 *功 能： <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key 字符串
	 *@return	Object
	 */
	public String get(String key);

	/**
	 * 
	 *功 能：获取对象 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月11日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key
	 *@return	Object
	 */
	public Object getObject(String key);

	/**
	 * 
	 *功 能： 设置过期时间<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key
	 *@param seconds
	 *@return	Long
	 */
	public Long expire(Object key, int seconds);

	/**
	 * 
	 *功 能： <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key 字符串
	 *@param seconds
	 *@return	Long
	 */
	public Long expire(String key, int seconds);

	/**
	 * 
	 *功 能：删除redis中数据 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key
	 *@return	Long
	 */
	public Long del(Object key);

	/**
	 * 
	 *功 能： <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param key 字符串
	 *@return	Long
	 */
	public Long del(String key);

	/**
	 * 
	 *功 能：获取jedis <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年7月7日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@return	Jedis
	 */
	public Jedis getJedis();
}
