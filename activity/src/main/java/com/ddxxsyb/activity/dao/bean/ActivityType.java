package com.ddxxsyb.activity.dao.bean;

public class ActivityType {

	/**
	 * 满减活动
	 */
	public static final String FULL_CUT = "FULL_CUT";

	public static String getActivityType(String type) {
		String typeInfo = "无";
		if (type == null) {
			return typeInfo;
		}
		switch (type) {
			case FULL_CUT:
				typeInfo = "订单满减";
				break;
		}
		return typeInfo;
	}

}
