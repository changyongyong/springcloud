package com.syb.miniapps.service.impl;

import java.util.Date;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.syb.api.entity.ResultEntity;
import com.syb.miniapps.api.bean.A;
import com.syb.miniapps.api.service.MiniappsTestService;
import com.syb.miniapps.dao.mapper.OnlineShoppingCatMapper;
import com.syb.miniapps.dao.model.OnlineShoppingCat;

@Service("miniappsTestService")
public class MiniappsTestServiceImpl implements MiniappsTestService {

	private static final Logger log = LogManager.getLogger(MiniappsTestServiceImpl.class);

	@Autowired
	private OnlineShoppingCatMapper onlineShoppingCatMapper;

	@Override
	public ResultEntity test(A form) {
		ResultEntity result = new ResultEntity(1, "sucess");
		log.info("启动test");
		OnlineShoppingCat cat = new OnlineShoppingCat();
		cat.setOscProductAmount(5);
		cat.setOscProductId(123);
		cat.setOscStoreId(161653);
		cat.setOscUserId(36);
		cat.setOscCreatedAt(new Date());
		cat.setOscUpdatedAt(new Date());
		onlineShoppingCatMapper.insertSelective(cat);
		return result;
	}

	@Override
	public ResultEntity testv1(A form) {
		// TODO Auto-generated method stub
		return null;
	}

}
