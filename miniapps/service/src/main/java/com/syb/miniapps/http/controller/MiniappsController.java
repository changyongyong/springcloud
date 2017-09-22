package com.syb.miniapps.http.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.syb.api.entity.ResultEntity;
import com.syb.miniapps.api.bean.A;
import com.syb.miniapps.api.service.MiniappsTestService;

@RestController
@RequestMapping("/c")
public class MiniappsController extends BaseController {

	@Autowired
	protected MiniappsTestService miniappsTest;

	@RequestMapping(value = "/test", method = RequestMethod.POST)
	public ResultEntity test(@RequestBody A a) {
		return miniappsTest.test(a);
	}

	@RequestMapping(value = "/testv1", method = RequestMethod.POST)
	public ResultEntity testv1(@RequestBody A a) throws Throwable {
		return miniappsTest.testv1(a);
	}

}
