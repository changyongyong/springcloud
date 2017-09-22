package com.ddxxsyb.article.dao.lang;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.ibatis.mapping.SqlSource;
import org.apache.ibatis.scripting.LanguageDriver;
import org.apache.ibatis.scripting.xmltags.XMLLanguageDriver;
import org.apache.ibatis.session.Configuration;

/**
 * 
 *<li>模块名 : SimpleSelectInExtendedLanguageDriver<br />
 *<li>文件名 : SimpleSelectInExtendedLanguageDriver.java<br />
 *<li>创建时间 : 2017年5月5日<br />
 *<li>实现功能 : 实现select in 功能 用()
 *<li><br />作者 : shenyf
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年5月5日 v0.0.1 shenyf 创建<br />
 */
public class SimpleSelectInExtendedLanguageDriver extends XMLLanguageDriver
		implements LanguageDriver {

	private final Pattern inPattern = Pattern.compile("\\(#\\{(\\w+)\\}\\)");

	@Override
	public SqlSource createSqlSource(
			Configuration configuration, String script, Class<?> parameterType) {

		Matcher matcher = inPattern.matcher(script);
		if (matcher.find()) {
			script = matcher.replaceAll(
					"(<foreach collection=\"$1\" item=\"__item\" separator=\",\" >#{__item}</foreach>)");
		}

		script = "<script>" + script + "</script>";
		return super.createSqlSource(configuration, script, parameterType);
	}
}
