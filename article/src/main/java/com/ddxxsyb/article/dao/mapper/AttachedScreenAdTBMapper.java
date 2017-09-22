package com.ddxxsyb.article.dao.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Lang;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.SelectProvider;
import org.apache.ibatis.annotations.Update;

import com.ddxxsyb.article.dao.lang.SimpleSelectInExtendedLanguageDriver;
import com.ddxxsyb.article.dao.pojo.AttachedScreenAdTB;
import com.ddxxsyb.article.dao.provider.AttachedScreenSqlProvider;

import tk.mybatis.mapper.common.Mapper;

public interface AttachedScreenAdTBMapper extends Mapper<AttachedScreenAdTB> {

	/**
	 * 
	 *功 能：没有逻辑删除的总数 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年6月20日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@return	int
	 */
	@Select("SELECT COUNT(*) FROM attached_screen_ad  WHERE asa_status!=99")
	int countAll();

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("SELECT COUNT(*) FROM attached_screen_ad  where asa_status in (#{statusArr}) ")
	int countByStatus(@Param("statusArr") Integer[] statusArr);

	@SelectProvider(type = AttachedScreenSqlProvider.class, method = "countByStatus")
	int countByStatusNew(Map<String, Object> queryMap);

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("SELECT COUNT(*) FROM attached_screen_ad  where asa_status in (#{statusArr}) AND (asa_all_city = 0 OR asa_city_ids like CONCAT('%',#{cityId},'%'))")
	int countByStatusAndCityId(
			@Param("statusArr") Integer[] statusArr, @Param("cityId") Integer cityId);

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	// ORDER BY asa_status ASC, asa_sort DESC 全部城市去除sort排序
	@Select("SELECT * FROM attached_screen_ad where asa_status in (#{statusArr}) ORDER BY asa_status ASC,asa_start_date ASC,asa_create_time DESC LIMIT #{limit} OFFSET #{offset}")
	@Results({ @Result(id = true, column = "asa_id", property = "id"),
			@Result(column = "asa_title", property = "title"),
			@Result(column = "asa_type", property = "type"),
			@Result(column = "asa_content", property = "content"),
			@Result(column = "asa_all_city", property = "allCity"),
			@Result(column = "asa_city_ids", property = "cityIds"),
			@Result(column = "asa_city_names", property = "cityNames"),
			@Result(column = "asa_start_date", property = "startDate"),
			@Result(column = "asa_end_date", property = "endDate"),
			@Result(column = "asa_image_one", property = "image1"),
			@Result(column = "asa_image_two", property = "image2"),
			@Result(column = "asa_status", property = "status"),
			@Result(column = "asa_create_time", property = "createTime"),
			@Result(column = "asa_update_time", property = "updateTime"),
			@Result(column = "asa_sort", property = "sort") })
	List<AttachedScreenAdTB> pageQueryByStatus(
			@Param("statusArr") Integer[] statusArr, @Param("limit") Integer limit,
			@Param("offset") Integer offset);

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("SELECT * FROM attached_screen_ad where asa_status in (#{statusArr}) AND (asa_all_city = 0 OR asa_city_ids like CONCAT('%',#{cityId},'%'))  ORDER BY asa_status ASC, asa_sort DESC,asa_start_date ASC,asa_create_time DESC LIMIT #{limit} OFFSET #{offset}")
	@Results({ @Result(id = true, column = "asa_id", property = "id"),
			@Result(column = "asa_title", property = "title"),
			@Result(column = "asa_type", property = "type"),
			@Result(column = "asa_content", property = "content"),
			@Result(column = "asa_all_city", property = "allCity"),
			@Result(column = "asa_city_ids", property = "cityIds"),
			@Result(column = "asa_city_names", property = "cityNames"),
			@Result(column = "asa_start_date", property = "startDate"),
			@Result(column = "asa_end_date", property = "endDate"),
			@Result(column = "asa_image_one", property = "image1"),
			@Result(column = "asa_image_two", property = "image2"),
			@Result(column = "asa_status", property = "status"),
			@Result(column = "asa_create_time", property = "createTime"),
			@Result(column = "asa_update_time", property = "updateTime"),
			@Result(column = "asa_sort", property = "sort") })
	List<AttachedScreenAdTB> pageQueryByStatusByCityId(
			@Param("statusArr") Integer[] statusArr, @Param("limit") Integer limit,
			@Param("offset") Integer offset, @Param("cityId") Integer cityId);

	@Update("UPDATE attached_screen_ad SET asa_sort=asa_sort+1 where asa_id = #{id} ")
	void upSort(@Param("id") Integer id);

	@Update("UPDATE attached_screen_ad SET asa_sort=asa_sort-1 where asa_id = #{id} ")
	void downSort(@Param("id") Integer id);

	@Update("UPDATE attached_screen_ad SET asa_sort= (SELECT a.asa_sort FROM (SELECT asa_sort FROM attached_screen_ad WHERE asa_id=#{id2}) a )  where asa_id =#{id1};UPDATE attached_screen_ad SET asa_sort=#{sort} where asa_id =#{id2};")
	void editUpSort(
			@Param("id1") Integer id1, @Param("id2") Integer id2, @Param("sort") Integer sort);

	@Update("UPDATE attached_screen_ad SET asa_status=#{status} where asa_id = #{id} ")
	void editStatus(@Param("id") Integer id, @Param("status") Integer status);

	/**
	 * 
	 *功 能：批量修改广告状态 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年6月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param ids
	 *@param status
	 *@return	int
	 */
	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Update("UPDATE attached_screen_ad SET asa_status=#{status} WHERE asa_id in (#{ids})  ")
	int editAdStatusByIds(@Param("ids") Integer[] ids, @Param("status") Integer status);

	// CONCAT('%',#{cityId},'%')
	@Select("SELECT * FROM attached_screen_ad where asa_status = 0 AND (asa_all_city = 0 OR asa_city_ids like CONCAT('%',#{cityId},'%')) ORDER BY asa_sort DESC,asa_start_date ASC,asa_create_time DESC LIMIT #{limit}")
	@Results({ @Result(id = true, column = "asa_id", property = "id"),
			@Result(column = "asa_title", property = "title"),
			@Result(column = "asa_type", property = "type"),
			@Result(column = "asa_content", property = "content"),
			@Result(column = "asa_all_city", property = "allCity"),
			@Result(column = "asa_city_ids", property = "cityIds"),
			@Result(column = "asa_start_date", property = "startDate"),
			@Result(column = "asa_end_date", property = "endDate"),
			@Result(column = "asa_image_one", property = "image1"),
			@Result(column = "asa_image_two", property = "image2"),
			@Result(column = "asa_status", property = "status"),
			@Result(column = "asa_create_time", property = "createTime"),
			@Result(column = "asa_update_time", property = "updateTime"),
			@Result(column = "asa_sort", property = "sort") })
	List<AttachedScreenAdTB>
			listAppAds(@Param("cityId") Integer cityId, @Param("limit") Integer limit);

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("SELECT asa_id,asa_start_date,asa_end_date FROM attached_screen_ad WHERE asa_status in (#{status}) ")
	@Results({ @Result(id = true, column = "asa_id", property = "id"),
			@Result(column = "asa_start_date", property = "startDate"),
			@Result(column = "asa_end_date", property = "endDate") })
	List<AttachedScreenAdTB> selectByStatus(@Param("status") Integer[] status);
}
