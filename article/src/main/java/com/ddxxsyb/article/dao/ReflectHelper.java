package com.ddxxsyb.article.dao;

import java.lang.reflect.Field;

/**
 * 
 *<li>模块名 : ReflectHelper<br />
 *<li>文件名 : ReflectHelper.java<br />
 *<li>创建时间 : 2017年4月24日<br />
 *<li>实现功能 : 反射工具类
 *<li><br />作者 : changyy
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年4月24日 v0.0.1 changyy 创建<br />
 */
public class ReflectHelper {
	public static Field getFieldByFieldName(Object obj, String fieldName) {
		for (Class<?> superClass = obj.getClass(); superClass != Object.class; superClass =
				superClass.getSuperclass()) {
			try {
				return superClass.getDeclaredField(fieldName);
			} catch (NoSuchFieldException e) {
			}
		}
		return null;
	}

	public static Object getValueByFieldName(Object obj, String fieldName)
			throws SecurityException, NoSuchFieldException, IllegalArgumentException,
			IllegalAccessException {
		Field field = getFieldByFieldName(obj, fieldName);
		Object value = null;
		if (field != null) {
			if (field.isAccessible()) {
				value = field.get(obj);
			} else {
				field.setAccessible(true);
				value = field.get(obj);
				field.setAccessible(false);
			}
		}
		return value;
	}

	public static void setValueByFieldName(Object obj, String fieldName, Object value)
			throws SecurityException, NoSuchFieldException, IllegalArgumentException,
			IllegalAccessException {
		Field field = obj.getClass().getDeclaredField(fieldName);
		if (field.isAccessible()) {
			field.set(obj, value);
		} else {
			field.setAccessible(true);
			field.set(obj, value);
			field.setAccessible(false);
		}
	}

	/**
	 * 
	 *功 能：获取父类属性赋值 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年4月24日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param obj
	 *@param fieldName
	 *@param value
	 *@throws SecurityException
	 *@throws NoSuchFieldException
	 *@throws IllegalArgumentException
	 *@throws IllegalAccessException	void
	 */
	public static void setValueBySuperFieldName(Object obj, String fieldName, Object value)
			throws SecurityException, NoSuchFieldException, IllegalArgumentException,
			IllegalAccessException {
		Field field = null;
		try {
			field = obj.getClass().getSuperclass().getDeclaredField(fieldName);
		} catch (Exception e) {
			field = getFieldByFieldName(obj, fieldName);
		}
		if (field.isAccessible()) {
			field.set(obj, value);
		} else {
			field.setAccessible(true);
			field.set(obj, value);
			field.setAccessible(false);
		}
	}

}
