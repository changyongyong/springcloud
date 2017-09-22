package com.ddxxsyb.order.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
// @Profile({ "dev", "test", "pre" }) // 在生产环境不开启
public class Swagger2Config {

	@Value("${swagger2.enable}")
	public boolean enable;

	@Bean
	public Docket createRestApi(@Qualifier("apiInfo") ApiInfo apiInfo) {
		return new Docket(DocumentationType.SWAGGER_2)
				.enable(enable).apiInfo(apiInfo).select()
				.apis(RequestHandlerSelectors.basePackage("com.ddxxsyb.order.http.controller"))
				.paths(PathSelectors.any()).build();
	}

	@Bean
	@Primary // 有多个bean的时候默认加载该bean
	public ApiInfo apiInfo(@Qualifier("contact") Contact contact) {
		return new ApiInfoBuilder()
				.title("Service-Order").contact(contact).description("订单服务模块")
				.termsOfServiceUrl("order").version("1.1").build();
	}

	@Bean
	@Primary
	public Contact contact() {
		return new Contact("常勇", "http://localhost/", "changy@diandainfo.com");
	}
}
