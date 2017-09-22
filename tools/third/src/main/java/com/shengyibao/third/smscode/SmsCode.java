package com.shengyibao.third.smscode;

import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.apache.http.HttpException;

import com.shengyibao.common.httputils.JSONHttpClient;

public class SmsCode {

	/**
	 * 
	 *功 能： 调用短信供应商短信接口 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月6日 v0.0.1 lt 创建<br />
	 *<br />----------------------------------------------------------------
	 *@return	int
	 */
	public static String sendPhoneNumberToProvider(Map<String, String> para) {

		String result = "-1";
		String url = para.get("url");
		/**
		* 目标手机号码，多个以“,”分隔，一次性调用最多100个号码，示例：139********,138********
		*/
		para.put("mob", para.get("mob"));
		/**
		 * 微米账号的接口UID
		 */
		para.put("uid", para.get("uid"));
		/**
		 * 微米账号的接口密码
		 */
		para.put("pas", para.get("pas"));
		/**
		 * 接口返回类型：json、xml、txt。默认值为txt
		 */
		para.put("type", "json");

		/**
		* 短信模板cid，通过微米后台创建，由在线客服审核。必须设置好短信签名，签名规范： 
		* 1、模板内容一定要带签名，签名放在模板内容的最前面；
		* 2、签名格式：【***】，签名内容为三个汉字以上（包括三个）；
		* 3、短信内容不允许双签名，即短信内容里只有一个“【】”
		*/
		para.put("cid", para.get("cid"));
		para.put("p1", para.get("p1"));

		try {
			result = new JSONHttpClient(url).postParameters(para);
		} catch (HttpException e) {
			e.printStackTrace();
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
		return result;

	}

	/**
	 * 
	 *功 能：随机生成n位短信验证码 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 changyy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param charCount 生成数字的位数
	 *@return	String
	 */
	public static String getRandNum(int charCount) {
		String charValue = "";
		for (int i = 0; i < charCount; i++) {
			char c = (char) (randomInt(0, 10) + '0');
			charValue += String.valueOf(c);
		}
		return charValue;
	}

	public static int randomInt(int from, int to) {
		Random r = new Random();
		return from + r.nextInt(to - from);
	}

	public static void main(String[] args) {
		Map<String, String> para = new HashMap<String, String>();

		String url = "http://api.weimi.cc/2/sms/send.html";
		/**
		* 目标手机号码，多个以“,”分隔，一次性调用最多100个号码，示例：139********,138********
		*/
		para.put("url", url);
		para.put("mob", "13823347495");
		/**
		 * 微米账号的接口UID
		 */
		para.put("uid", "R2fnMH8YRWQi");
		/**
		 * 微米账号的接口密码
		 */
		para.put("pas", "4k6yuqxq");
		/**
		 * 接口返回类型：json、xml、txt。默认值为txt
		 */
		para.put("type", "json");
		/**
		* 短信模板cid，通过微米后台创建，由在线客服审核。必须设置好短信签名，签名规范： 
		* 1、模板内容一定要带签名，签名放在模板内容的最前面；
		* 2、签名格式：【***】，签名内容为三个汉字以上（包括三个）；
		* 3、短信内容不允许双签名，即短信内容里只有一个“【】”
		*/
		para.put("cid", "aDdOKKe57ppE");
		para.put("p1", getRandNum(2));

		try {
			System.out.println(sendPhoneNumberToProvider(para));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
