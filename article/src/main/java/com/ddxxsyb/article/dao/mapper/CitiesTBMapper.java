package com.ddxxsyb.article.dao.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Lang;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import com.ddxxsyb.article.dao.lang.SimpleSelectInExtendedLanguageDriver;
import com.ddxxsyb.article.dao.pojo.CitiesTB;

import tk.mybatis.mapper.common.Mapper;

public interface CitiesTBMapper extends Mapper<CitiesTB> {
	@Select("SELECT DISTINCT c.* FROM stores s  JOIN cities c ON s.CityId=c.id ")
	List<CitiesTB> queryCities();

	@Select("select * from cities where id = #{id}")
	CitiesTB queryCityById(@Param("id") Integer id);

	@Select("select cityName from cities where id = #{id}")
	String queryCityNameById(@Param("id") Integer id);

	@Select("select dadacityName from cities where id = #{id}")
	String queryDadaCityNameById(@Param("id") Integer id);

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("select cityName from cities where id in (#{ids}) ORDER BY id asc")
	List<String> queryCityNames(@Param("ids") String[] ids);

	/**
	 * 
	 *功 能：查询已开放的城市列表 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年6月21日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@return	List<CitiesTB>
	 */
	@Select("SELECT * FROM cities WHERE id in(SELECT DISTINCT CityId FROM stores WHERE isSybUser=1) ORDER BY id asc")
	List<CitiesTB> quertOpenCities();

	@Select("SELECT id FROM cities WHERE id in(SELECT DISTINCT CityId FROM stores WHERE isSybUser=1) ORDER BY id asc")
	List<Integer> quertOpenCityIds();

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("SELECT * FROM cities WHERE id in (#{ids}) ORDER BY id asc")
	List<CitiesTB> queryHaveCities(@Param("ids") Integer[] ids);

}
