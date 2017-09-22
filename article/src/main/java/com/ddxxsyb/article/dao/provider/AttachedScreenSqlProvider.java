package com.ddxxsyb.article.dao.provider;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.jdbc.SQL;

public class AttachedScreenSqlProvider {

	public String countByStatus(Map<String, Object> map) {
		String sql = new SQL() {
			{
				SELECT("COUNT(*)");
				FROM("attached_screen_ad");
				if (map.containsKey("statusArr")) {
					List<Integer> states = Arrays.asList((Integer[]) map.get("statusArr"));
					WHERE("asa_status in(" + StringUtils.join(states, ",") + ")");
				}
				if (map.containsKey("hasCityIds")) {// 负责城市ids
					WHERE("CityId in(" + map.get("hasCityIds") + ")");
				}
			}
		}.toString();
		return sql;
	}
}
