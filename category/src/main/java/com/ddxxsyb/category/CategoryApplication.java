package com.ddxxsyb.category;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.cloud.netflix.feign.EnableFeignClients;
import org.springframework.cloud.netflix.hystrix.EnableHystrix;
import org.springframework.cloud.netflix.hystrix.dashboard.EnableHystrixDashboard;
import org.springframework.context.annotation.ImportResource;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * 目录服务启动类
 * @author DELL
 *
 */
@SpringBootApplication   //springboot启动类注解
@EnableDiscoveryClient  //启用服务注册与发现
@EnableFeignClients  //开启feign远程调用
@EnableHystrix   	//打开断路器
@EnableHystrixDashboard  //打开断路器仪表盘
@ServletComponentScan // 加载servlet的Filter拦截器
@RefreshScope   //配置中心自动刷新
@ImportResource({ "classpath:spring-context.xml" }) // 加载xml配置文件
public class CategoryApplication extends WebMvcConfigurerAdapter {

	private static final Logger log = LoggerFactory.getLogger(CategoryApplication.class);

	private static String envName;

	@Value("${spring.profiles.active}")
	private String env;

	public static void main(String[] args) throws Exception {
		SpringApplication.run(CategoryApplication.class, args);
		log.info("目录服务启动完成：" + envName);
	}

	/**
	 * 
	 * 功 能： <br />
	 * 加载http请求拦截器，例如：登录状态校验等<br />
	 * ----------------------------------------------------------------<br />
	 * 修改记录 ：<br />
	 * 日 期 版本 修改人 修改内容<br />
	 * ----------------------------------------------------------------<br />
	 * 
	 * @param registry
	 *            <br />
	 */
	@Override
	public void addInterceptors(InterceptorRegistry registry) {
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
