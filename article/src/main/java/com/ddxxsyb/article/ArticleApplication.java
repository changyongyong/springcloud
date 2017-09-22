package com.ddxxsyb.article;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.cloud.netflix.feign.EnableFeignClients;
import org.springframework.context.annotation.ImportResource;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@EnableDiscoveryClient
@SpringBootApplication(scanBasePackages = { "com.ddxxsyb.article.**" })
@ServletComponentScan // 加载servlet的Filter拦截器
@ImportResource({ "classpath:spring-context.xml" }) // 加载xml配置文件
@EnableFeignClients
@RefreshScope
public class ArticleApplication extends WebMvcConfigurerAdapter {

	private static final Logger logger = LoggerFactory.getLogger(ArticleApplication.class);

	private static String envName;

	@Value("${spring.profiles.active}")
	private String env;

	public static void main(String[] args) throws Exception {
		SpringApplication.run(ArticleApplication.class, args);
		logger.info("资讯广告服务启动完成：" + envName);
	}

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		// 商家端小程序拦截器
		/*registry
				.addInterceptor(new BusinessMiniAppsInterceptor()).addPathPatterns("/articles/**")
				.excludePathPatterns("/activity/nearby");*/
		super.addInterceptors(registry);
	}

	@PostConstruct
	public void init() {
		switch (env) {
			case "dev":
				envName = "开发环境";
				break;
			case "test":
				envName = "测试环境";
				break;
			case "pre":
				envName = "预发布环境";
				break;
			case "pro":
				envName = "生产环境";
				break;
			default:
				break;
		}
	}
}
