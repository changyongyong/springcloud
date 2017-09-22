package com.ddxxsyb.category.dao.mapper;



import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import com.ddxxsyb.category.dao.pojo.BStoreProductCatalog;

import tk.mybatis.mapper.common.Mapper;


public interface BStoreProductCatelogsMapper extends Mapper<BStoreProductCatalog> {
	@Select("select * from b_store_product_catalog where bspc_store_id= #{storeId} AND bspc_flag = 1 AND bspc_sequence > #{sequence}")
	List<BStoreProductCatalog> selectBStoreProductCatalogThanSequence(
			@Param("storeId") Integer storeId, @Param("sequence") Integer sequence);
	
	@Select("SELECT COUNT(*) FROM b_store_product_catalog WHERE bspc_store_id =#{storeId} AND bspc_flag = 1  ")
	int selectBStoreProductCatalogByStoreId(@Param("storeId") Integer storeId);

	@Select("select * from b_store_product_catalog where bspc_store_id= #{storeId} AND bspc_flag = 1 ORDER BY bspc_sequence ASC LIMIT 0,99")
	List<BStoreProductCatalog> queryCatalog(Integer storeId);

	

}
