package com.ddxxsyb.category.http;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@EnableSwagger2
@Configuration
public class Swagger2 {

	@Value("${swagger2.enable}")
	boolean enable;

	@Bean
	public Docket createRestApi() {
		return new Docket(DocumentationType.SWAGGER_2).enable(enable).apiInfo(apiInfo()).select()
				.apis(RequestHandlerSelectors.basePackage("com.ddxxsyb.category.http.controller")).paths(PathSelectors.any())
				.build();
	}

	private ApiInfo apiInfo() {
		return new ApiInfoBuilder().title("生意宝目录接口api").description("生意宝目录服务模块的相关接口api文档").contact(new Contact("yuxy",
				"","yuxy@diandainfo.com"))
				.termsOfServiceUrl("")
				.version("1.0").build();
	}
}
