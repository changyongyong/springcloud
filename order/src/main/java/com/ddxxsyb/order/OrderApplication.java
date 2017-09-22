package com.ddxxsyb.order;

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

/**
 * 
 *<li>模块名 : OrderApplication<br />
 *<li>文件名 : OrderApplication.java<br />
 *<li>创建时间 : 2017年8月22日<br />
 *<li>实现功能 : 服务启动类
 *<li><br />作者 : 常勇
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年8月22日 v0.0.1 常勇 创建<br />
 */
@SpringBootApplication(scanBasePackages = { "com.ddxxsyb.order.**" })
@ServletComponentScan // 加载servlet的Filter拦截器
@ImportResource({ "classpath:spring-context.xml" }) // 加载xml配置文件
@EnableDiscoveryClient // 向注册中心注册暴漏服务
@EnableFeignClients
@RefreshScope
public class OrderApplication extends WebMvcConfigurerAdapter {

	private static Logger log = LoggerFactory.getLogger(OrderApplication.class);

	private static String envName;

	@Value("${spring.profiles.active}")
	private String env;

	public static void main(String[] args) throws Exception {
		SpringApplication.run(OrderApplication.class, args);
		log.info("订单服务启动完成：" + envName);
	}

	/**
	 * 
	 * 功 能： <br />
	 * 加载http请求拦截器，例如：登录状态校验等<br />
	 * ----------------------------------------------------------------<br />
	 * 修改记录 ：<br />
	 * 日 期 版本 修改人 修改内容<br />
	 * 2017年4月11日 v0.0.1 changyy 创建<br />
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
