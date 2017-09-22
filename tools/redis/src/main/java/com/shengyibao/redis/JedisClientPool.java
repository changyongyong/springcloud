package com.shengyibao.redis;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class JedisClientPool implements JedisClient {

	private static final Logger logger = LogManager.getLogger(JedisClientPool.class);

	private JedisPool jedisPool;

	public JedisClientPool(JedisPool jedisPool) {
		this.jedisPool = jedisPool;
	}

	@Override
	public Boolean exists(Object key) {
		Jedis jedis = jedisPool.getResource();
		Boolean result = false;
		try {
			logger.debug("redis查询是否存在数据：" + key);
			result = jedis.exists(SerializeUtils.serialize(key));
			logger.debug("redis查询是否存在数据结果：" + result);
		} catch (Exception e) {
			logger.error("redis查询是否存在数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public String setExpire(Object key, Object value, int cacheSeconds) {
		Jedis jedis = jedisPool.getResource();
		String result = null;
		try {
			logger.debug("redis存储有期限数据：" + key);
			result = jedis.setex(
					SerializeUtils.serialize(key), cacheSeconds, SerializeUtils.serialize(value));
			logger.debug("redis存储有期限数据结果：" + result);
		} catch (Exception e) {
			logger.error("redis存储有期限数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public String setExpire(String key, Object value, int cacheSeconds) {
		Jedis jedis = jedisPool.getResource();
		String result = null;
		try {
			logger.debug("redis存储有期限数据：" + key);
			result = jedis.setex(key.getBytes(), cacheSeconds, SerializeUtils.serialize(value));
			logger.debug("redis存储有期限数据结果：" + result);
		} catch (Exception e) {
			logger.error("redis存储有期限数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public String set(Object key, Object value) {
		Jedis jedis = jedisPool.getResource();
		String result = null;
		try {
			logger.debug("redis存储数据：" + key);
			result = jedis.set(SerializeUtils.serialize(key), SerializeUtils.serialize(value));
			logger.debug("redis存储数据结果：" + result);
		} catch (Exception e) {
			logger.error("redis存储数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public String set(String key, Object value) {
		Jedis jedis = jedisPool.getResource();
		String result = null;
		try {
			logger.debug("redis存储数据：" + key);
			result = jedis.set(key.getBytes(), SerializeUtils.serialize(value));
			logger.debug("redis存储数据结果：" + result);
		} catch (Exception e) {
			logger.error("redis存储数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public Object get(Object key) {
		Jedis jedis = jedisPool.getResource();
		Object result = null;
		try {
			logger.debug("redis获取数据：" + key);
			result = SerializeUtils.unSerialize(jedis.get(SerializeUtils.serialize(key)));
			logger.debug("redis获取数据结果：" + result);
		} catch (Exception e) {
			logger.error("redis获取数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public Object getObject(String key) {
		Jedis jedis = jedisPool.getResource();
		Object result = null;
		try {
			logger.debug("redis获取数据：" + key);
			result = SerializeUtils.unSerialize(jedis.get(key.getBytes()));
			logger.debug("redis获取数据结果：" + result);
		} catch (Exception e) {
			logger.error("redis获取数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public Long expire(Object key, int seconds) {
		Jedis jedis = jedisPool.getResource();
		Long result = null;
		try {
			logger.debug("redis设置数据过期时间：" + key);
			result = jedis.expire(SerializeUtils.serialize(key), seconds);
			logger.debug("redis设置数据过期时间：" + result);
		} catch (Exception e) {
			logger.error("redis设置数据过期时间异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public Long del(Object key) {
		Jedis jedis = jedisPool.getResource();
		Long result = null;
		try {
			logger.debug("redis删除数据：" + key);
			result = jedis.del(SerializeUtils.serialize(key));
			logger.debug("redis删除数据：" + result);
		} catch (Exception e) {
			logger.error("redis删除数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public Boolean exists(String key) {
		Jedis jedis = jedisPool.getResource();
		Boolean result = false;
		try {
			logger.debug("redis查询是否存在数据：" + key);
			result = jedis.exists(key);
			logger.debug("redis查询是否存在数据结果：" + result);
		} catch (Exception e) {
			logger.error("redis查询是否存在数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public String setExpire(String key, String value, int cacheSeconds) {
		Jedis jedis = jedisPool.getResource();
		String result = null;
		try {
			logger.debug("redis存储有期限数据：" + key);
			result = jedis.setex(key, cacheSeconds, value);
			logger.debug("redis存储有期限数据结果：" + result);
		} catch (Exception e) {
			logger.error("redis存储有期限数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public String set(String key, String value) {
		Jedis jedis = jedisPool.getResource();
		String result = null;
		try {
			logger.debug("redis存储数据：" + key);
			result = jedis.set(key, value);
			logger.debug("redis存储数据结果：" + result);
		} catch (Exception e) {
			logger.error("redis存储数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public String get(String key) {
		Jedis jedis = jedisPool.getResource();
		String result = null;
		try {
			logger.debug("redis获取数据：" + key);
			result = jedis.get(key);
			logger.debug("redis获取数据结果：" + result);
		} catch (Exception e) {
			logger.error("redis获取数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public Long expire(String key, int seconds) {
		Jedis jedis = jedisPool.getResource();
		Long result = null;
		try {
			logger.debug("redis设置数据过期时间：" + key);
			result = jedis.expire(key, seconds);
			logger.debug("redis设置数据过期时间：" + result);
		} catch (Exception e) {
			logger.error("redis设置数据过期时间异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public Long del(String key) {
		Jedis jedis = jedisPool.getResource();
		Long result = null;
		try {
			logger.debug("redis删除数据：" + key);
			result = jedis.del(key);
			logger.debug("redis删除数据：" + result);
		} catch (Exception e) {
			logger.error("redis删除数据异常：" + e.getLocalizedMessage());
		} finally {
			jedis.close();
		}
		return result;
	}

	@Override
	public Jedis getJedis() {
		Jedis jedis = jedisPool.getResource();
		return jedis;
	}

}
