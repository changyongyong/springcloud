package com.syb.product.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.syb.api.entity.ResultEntity;
import com.syb.product.api.test.ExampleTestService;
import com.syb.product.api.test.form.ExampleTest;
import com.syb.product.mapper.BStoreBillRecordMapper;

@Service("example")
public class ExampleImpl implements ExampleTestService {

	private static final Logger log = LogManager.getLogger(ExampleImpl.class);

	@Autowired
	private BStoreBillRecordMapper bStoreBillRecordMapper;

	@Override
	public ResultEntity test(ExampleTest form) {
		ResultEntity result = new ResultEntity(1, "sucess");
		log.info("启动test");
		return result;
	}

	@Override
	public ResultEntity testv1(ExampleTest form) {
		ResultEntity result = new ResultEntity(1, "sucess");
		log.info("启动testv1");
		return result;
	}

}
