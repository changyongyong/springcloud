package com.ddxxsyb.activity.dao.mapper;

import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;

import com.ddxxsyb.activity.dao.pojo.FullCutTB;

import tk.mybatis.mapper.common.Mapper;

public interface FullCutTBMapper extends Mapper<FullCutTB> {
	@Select("select * from store_activity_full_cut where sa_id=#{id}")
	@Results({ @Result(id = true, column = "safc_id", property = "id"),
			@Result(column = "sa_id", property = "storeActivityId"),
			@Result(column = "safc_full_cut_one", property = "fullCutOne"),
			@Result(column = "safc_full_cut_two", property = "fullCutTwo"),
			@Result(column = "safc_full_cut_three", property = "fullCutThree") })
	FullCutTB selectFullCutByStoreActivityId(Integer id);

}
