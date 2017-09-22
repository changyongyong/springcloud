package com.syb.product.http.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.syb.api.entity.ResultEntity;
import com.syb.product.api.test.ExampleTestService;
import com.syb.product.api.test.form.ExampleTest;

@RestController
@RequestMapping("/example")
public class ExampleController extends BaseController {

	@Autowired
	protected ExampleTestService exampleService;

	@RequestMapping(value = "/example/test", method = RequestMethod.POST)
	public ResultEntity test(@RequestBody ExampleTest form) {
		return exampleService.test(form);
	}

	@RequestMapping(value = "/example/testv1", method = RequestMethod.POST)
	public ResultEntity testv1(@RequestBody ExampleTest form) throws Throwable {
		return exampleService.testv1(form);
	}

}
