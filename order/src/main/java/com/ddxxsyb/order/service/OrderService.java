package com.ddxxsyb.order.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ddxxsyb.order.dao.mapper.OrderMapper;
import com.ddxxsyb.order.dao.pojo.Order;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.syb.api.tools.GsonUtil;

import tk.mybatis.mapper.entity.Example;
import tk.mybatis.mapper.entity.Example.Criteria;

@Service("orderService")
@Transactional
public class OrderService {

	private static Logger logger = LoggerFactory.getLogger(OrderService.class);

	@Autowired
	OrderMapper orderMapper;

	public void test() {
		Page<Order> page = PageHelper.startPage(1, 11);
		Example example = new Example(Order.class);
		Criteria cr = example.createCriteria();
		cr.andEqualTo("orderId", 1);
		List<Order> list = orderMapper.selectByExample(example);
		// logger.info("分页结果：{}", GsonUtil.GsonString(page));
		logger.info("分页查询结果：{}", GsonUtil.GsonString(list));
	}

}
