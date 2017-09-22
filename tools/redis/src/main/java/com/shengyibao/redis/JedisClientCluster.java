package com.shengyibao.redis;

import redis.clients.jedis.Jedis;

/**
 * 
 *<li>模块名 : JedisClientCluster<br />
 *<li>文件名 : JedisClientCluster.java<br />
 *<li>创建时间 : 2017年5月8日<br />
 *<li>实现功能 : redis集群使用，现在不支持，无法使用
 *<li><br />作者 : changyy
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年5月8日 v0.0.1 changyy 创建<br />
 */
@Deprecated
public class JedisClientCluster implements JedisClient {

	@Override
	public Boolean exists(Object key) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Boolean exists(String key) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String setExpire(Object key, Object value, int cacheSeconds) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String setExpire(String key, String value, int cacheSeconds) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String set(Object key, Object value) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String set(String key, String value) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Object get(Object key) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String get(String key) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Long expire(Object key, int seconds) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Long expire(String key, int seconds) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Long del(Object key) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Long del(String key) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String setExpire(String key, Object value, int cacheSeconds) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String set(String key, Object value) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Object getObject(String key) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Jedis getJedis() {
		// TODO Auto-generated method stub
		return null;
	}

}
