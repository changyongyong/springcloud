package com.ddxxsyb.activity.dao.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Lang;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.ddxxsyb.activity.dao.lang.SimpleSelectInExtendedLanguageDriver;
import com.ddxxsyb.activity.dao.pojo.StoreActivityTB;

import tk.mybatis.mapper.common.Mapper;

public interface StoreActivityTBMapper extends Mapper<StoreActivityTB> {

	/**
	 * 
	 *功 能： 主键查询<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月27日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param id
	 *@return
	 */
	@Select("SELECT * FROM store_activity WHERE sa_id=#{id} and sa_del_flag='N' ")
	@Results({ @Result(id = true, column = "sa_id", property = "id"),
			@Result(column = "sa_type", property = "type"),
			@Result(column = "sa_name", property = "name"),
			@Result(column = "sa_start_time", property = "startTime"),
			@Result(column = "sa_end_time", property = "endTime"),
			@Result(column = "sa_create_time", property = "createTime"),
			@Result(column = "sa_status", property = "status"),
			@Result(column = "store_id", property = "storeId") })
	StoreActivityTB selectByPrimaryKey(@Param("id") Object id);

	/**
	 * 
	 *功 能：逻辑删除 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月27日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param id	void
	 */
	@Update("UPDATE store_activity SET sa_del_flag='Y' WHERE sa_id=#{id}")
	int logicDelete(@Param("id") Integer id);

	/**
	 * 
	 *功 能：根据状态获得活动集合 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月27日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param storeId
	 *@param status
	 *@return	int
	 */
	@Select("SELECT * FROM store_activity WHERE store_id=#{storeId} AND sa_status=#{status} AND sa_del_flag='N' ")
	@Results({ @Result(id = true, column = "sa_id", property = "id"),
			@Result(column = "sa_type", property = "type"),
			@Result(column = "sa_name", property = "name"),
			@Result(column = "sa_start_time", property = "startTime"),
			@Result(column = "sa_end_time", property = "endTime"),
			@Result(column = "sa_create_time", property = "createTime"),
			@Result(column = "sa_status", property = "status"),
			@Result(column = "store_id", property = "storeId") })
	List<StoreActivityTB> selectStoreActivitiesByStatus(
			@Param("storeId") Integer storeId, @Param("status") String status);

	/**
	 * 
	 *功 能：设置活动状态 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月27日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param id
	 *@param status
	 *@return	int
	 */
	@Update("UPDATE store_activity SET sa_status=#{status} WHERE sa_id=#{id} AND sa_del_flag='N' ")
	int editActivityStatus(@Param("id") Integer id, @Param("status") String status);

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("select * from store_activity where store_id=#{storeId} and sa_status in (#{status}) AND sa_del_flag='N' ORDER BY sa_create_time desc")
	@Results({ @Result(id = true, column = "sa_id", property = "id"),
			@Result(column = "sa_type", property = "type"),
			@Result(column = "sa_name", property = "name"),
			@Result(column = "sa_start_time", property = "startTime"),
			@Result(column = "sa_end_time", property = "endTime"),
			@Result(column = "sa_create_time", property = "createTime"),
			@Result(column = "sa_status", property = "status"),
			@Result(column = "store_id", property = "storeId") })
	List<StoreActivityTB> selectActivitiesByStatusAndStoreId(
			@Param("status") String[] status, @Param("storeId") Integer storeId);

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("select * from store_activity where store_id=#{storeId} and sa_status in (#{status}) AND sa_del_flag='N' ORDER BY sa_create_time desc LIMIT #{limit} OFFSET #{offset}")
	@Results({ @Result(id = true, column = "sa_id", property = "id"),
			@Result(column = "sa_type", property = "type"),
			@Result(column = "sa_name", property = "name"),
			@Result(column = "sa_start_time", property = "startTime"),
			@Result(column = "sa_end_time", property = "endTime"),
			@Result(column = "sa_create_time", property = "createTime"),
			@Result(column = "sa_status", property = "status"),
			@Result(column = "store_id", property = "storeId") })
	List<StoreActivityTB> pageSelectActivitiesByStatusAndStoreId(
			@Param("status") String[] status, @Param("storeId") Integer storeId,
			@Param("limit") Integer limit, @Param("offset") Integer offset);

	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("select count(*) from store_activity where store_id=#{storeId} and sa_status in (#{status}) AND sa_del_flag='N' ")
	int countActivitiesByStatusAndStoreId(
			@Param("status") String[] status, @Param("storeId") Integer storeId);

	/**
	 * 
	 *功 能：附近店铺未开始进行中的项目 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年6月1日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param storeIds
	 *@param status
	 *@return	List<StoreActivityTB>
	 */
	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("select * from store_activity where store_id in (#{storeIds}) AND sa_status in (#{status}) AND sa_del_flag='N' ORDER BY sa_status asc,sa_start_time asc")
	@Results({ @Result(id = true, column = "sa_id", property = "id"),
			@Result(column = "sa_type", property = "type"),
			@Result(column = "sa_name", property = "name"),
			@Result(column = "sa_start_time", property = "startTime"),
			@Result(column = "sa_end_time", property = "endTime"),
			@Result(column = "sa_create_time", property = "createTime"),
			@Result(column = "sa_status", property = "status"),
			@Result(column = "store_id", property = "storeId") })
	List<StoreActivityTB> selectActivitiesBystoreIds(
			@Param("storeIds") Integer[] storeIds, @Param("status") String[] status);

	/**
	 * 
	 *功 能： 根据活动状态查询活动<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月31日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param status
	 *@return	List<StoreActivityTB>
	 */
	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Select("SELECT sa_id,sa_start_time,sa_end_time FROM store_activity WHERE sa_status in (#{status}) AND sa_del_flag='N' ")
	@Results({ @Result(id = true, column = "sa_id", property = "id"),
			@Result(column = "sa_start_time", property = "startTime"),
			@Result(column = "sa_end_time", property = "endTime") })
	List<StoreActivityTB> selectByStatus(@Param("status") String[] status);

	/**
	 * 
	 *功 能：批量修改活动状态 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月31日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param ids
	 *@param status
	 *@return	int
	 */
	@Lang(SimpleSelectInExtendedLanguageDriver.class)
	@Update("UPDATE store_activity SET sa_status=#{status} WHERE sa_id in (#{ids}) AND sa_del_flag='N' ")
	int editActivityStatusByIds(@Param("ids") Integer[] ids, @Param("status") String status);

	/**
	 * 
	 *功 能：获取活动id,name,type <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月31日 v0.0.1 shenyf 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param storeId
	 *@return	StoreActivityTB
	 */
	@Select("SELECT sa_id,sa_type,sa_name FROM store_activity WHERE store_id=#{storeId} AND sa_status=#{status} AND sa_del_flag='N' ")
	@Results({ @Result(id = true, column = "sa_id", property = "id"),
			@Result(column = "sa_type", property = "type"),
			@Result(column = "sa_name", property = "name") })
	StoreActivityTB
			selectOneOnActivity(@Param("storeId") Integer storeId, @Param("status") String status);
}
