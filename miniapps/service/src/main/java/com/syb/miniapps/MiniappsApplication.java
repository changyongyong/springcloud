package com.syb.miniapps;

import javax.annotation.PostConstruct;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * 
 *<li>模块名 : MiniappsApplication<br />
 *<li>文件名 : MiniappsApplication.java<br />
 *<li>创建时间 : 2017年8月9日<br />
 *<li>实现功能 : 服务启动类
 *<li><br />作者 : yuxy
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年8月9日 v0.0.1 yuxy 创建<br />
 */
@Configuration
@ComponentScan(basePackages = { "com.syb.miniapps.**" }) // 组件扫描
@EnableAutoConfiguration // 启用自动配置
@ServletComponentScan // 加载servlet的Filter拦截器
@ImportResource({ "classpath:spring-context.xml" }) // 加载xml配置文件
public class MiniappsApplication extends WebMvcConfigurerAdapter {

	private static final Logger log = LogManager.getLogger(MiniappsApplication.class);

	private static String envName;

	@Value("${miniapps.system.env}")
	private String env;

	public static void main(String[] args) throws Exception {
		SpringApplication.run(MiniappsApplication.class, args);
		log.info("测试服务启动完成：" + envName);
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
