package com.ddxxsyb.activity;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.ParameterBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.schema.ModelRef;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.service.Parameter;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
public class Swagger2Config {

	@Value("${swagger2.enable}")
	boolean enable;

	@Bean
	public Docket createRestApi() {
		ParameterBuilder tokenPar = new ParameterBuilder();
		List<Parameter> pars = new ArrayList<Parameter>();
		tokenPar
				.name("Authorization").description("令牌").modelRef(new ModelRef("string"))
				.parameterType("header").required(false).build();
		pars.add(tokenPar.build());
		return new Docket(DocumentationType.SWAGGER_2)
				.enable(enable).apiInfo(apiInfo()).select()
				.apis(RequestHandlerSelectors.basePackage("com.ddxxsyb.activity.http.controller"))
				.paths(PathSelectors.any()).build().globalOperationParameters(pars);
	}

	private ApiInfo apiInfo() {
		return new ApiInfoBuilder()
				.title("Service-Activity").description("活动服务模块").termsOfServiceUrl("")
				.contact(new Contact("shenyf", "", "shenyf@diandainfo.com")).version("1.0").build();
	}
}
