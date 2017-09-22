package com.ddxxsyb.article.dao.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Lang;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.ddxxsyb.article.dao.lang.SimpleSelectInExtendedLanguageDriver;
import com.ddxxsyb.article.dao.pojo.ScreenAdSortTB;

import tk.mybatis.mapper.common.Mapper;

public interface ScreenAdSortTBMapper extends Mapper<ScreenAdSortTB> {

	@Update("UPDATE attached_screen_ad_sort SET asas_sort= (SELECT a.asas_sort FROM (SELECT asas_sort FROM attached_screen_ad_sort WHERE asas_id=#{id2}) a )  where asas_id =#{id1};UPDATE attached_screen_ad_sort SET asas_sort=#{sort} where asas_id =#{id2};")
	void editSort(
			@Param("id1") Integer id1, @Param("id2") Integer id2, @Param("sort") Integer sort);

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("SELECT * FROM attached_screen_ad_sort where asa_status in (#{statusArr}) AND asas_city_id = ${cityId}  ORDER BY asa_status ASC, asas_sort DESC LIMIT #{limit} OFFSET #{offset}")
	@Results({ @Result(id = true, column = "asas_id", property = "id"),
			@Result(column = "asa_id", property = "adId"),
			@Result(column = "asa_status", property = "status"),
			@Result(column = "asas_city_id", property = "cityId"),
			@Result(column = "asas_city_name", property = "cityName"),
			@Result(column = "asas_sort", property = "sort") })
	List<ScreenAdSortTB> pageQueryByStatusByCityId(
			@Param("statusArr") Integer[] statusArr, @Param("limit") Integer limit,
			@Param("offset") Integer offset, @Param("cityId") Integer cityId);

	@Update("UPDATE attached_screen_ad_sort SET asa_status=#{status} where asa_id = #{id} ")
	void editStatus(@Param("id") Integer id, @Param("status") Integer status);

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Update("UPDATE attached_screen_ad_sort SET asa_status=#{status} WHERE asa_id in (#{ids})  ")
	int editAdStatusByIds(@Param("ids") Integer[] ids, @Param("status") Integer status);

}
