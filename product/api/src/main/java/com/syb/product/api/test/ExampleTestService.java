package com.syb.product.api.test;

import com.syb.api.entity.ResultEntity;
import com.syb.product.api.test.form.ExampleTest;

public interface ExampleTestService {

	public ResultEntity test(ExampleTest form);

	public ResultEntity testv1(ExampleTest form);

}
