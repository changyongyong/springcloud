package com.syb.product.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Param;

import com.syb.product.model.BStoreBillRecord;
import com.syb.product.model.BStoreBillRecordExample;

public interface BStoreBillRecordMapper {
    /**
     * This method was generated by MyBatis Generator.
     * This method corresponds to the database table b_store_bill_record
     *
     * @mbggenerated
     */
    int countByExample(BStoreBillRecordExample example);

    /**
     * This method was generated by MyBatis Generator.
     * This method corresponds to the database table b_store_bill_record
     *
     * @mbggenerated
     */
    int deleteByExample(BStoreBillRecordExample example);

    /**
     * This method was generated by MyBatis Generator.
     * This method corresponds to the database table b_store_bill_record
     *
     * @mbggenerated
     */
    int deleteByPrimaryKey(Integer bsbId);

    /**
     * This method was generated by MyBatis Generator.
     * This method corresponds to the database table b_store_bill_record
     *
     * @mbggenerated
     */
    int insert(BStoreBillRecord record);

    /**
     * This method was generated by MyBatis Generator.
     * This method corresponds to the database table b_store_bill_record
     *
     * @mbggenerated
     */
    int insertSelective(BStoreBillRecord record);

    /**
     * This method was generated by MyBatis Generator.
     * This method corresponds to the database table b_store_bill_record
     *
     * @mbggenerated
     */
    List<BStoreBillRecord> selectByExample(BStoreBillRecordExample example);

    /**
     * This method was generated by MyBatis Generator.
     * This method corresponds to the database table b_store_bill_record
     *
     * @mbggenerated
     */
    BStoreBillRecord selectByPrimaryKey(Integer bsbId);

    /**
     * This method was generated by MyBatis Generator.
     * This method corresponds to the database table b_store_bill_record
     *
     * @mbggenerated
     */
    int updateByExampleSelective(@Param("record") BStoreBillRecord record, @Param("example") BStoreBillRecordExample example);

    /**
     * This method was generated by MyBatis Generator.
     * This method corresponds to the database table b_store_bill_record
     *
     * @mbggenerated
     */
    int updateByExample(@Param("record") BStoreBillRecord record, @Param("example") BStoreBillRecordExample example);

    /**
     * This method was generated by MyBatis Generator.
     * This method corresponds to the database table b_store_bill_record
     *
     * @mbggenerated
     */
    int updateByPrimaryKeySelective(BStoreBillRecord record);

    /**
     * This method was generated by MyBatis Generator.
     * This method corresponds to the database table b_store_bill_record
     *
     * @mbggenerated
     */
    int updateByPrimaryKey(BStoreBillRecord record);
}