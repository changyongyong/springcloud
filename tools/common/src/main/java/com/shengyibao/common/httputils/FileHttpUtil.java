package com.shengyibao.common.httputils;

import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class FileHttpUtil {
	// 上传文件到nodejs的文件服务器
	public static String uplaod(String actionUrl, Map<String, String> params, InputStream is) {
		InputStream in = null;
		String BOUNDARY = UUID.randomUUID().toString();
		String PREFFIX = "--", LINEND = "\r\n";
		String MULTIPART_FROM_DATA = "multipart/form-data";
		String CHARSET = "UTF-8";
		URL uri;
		StringBuilder sb2 = null;
		try {
			uri = new URL(actionUrl);
			HttpURLConnection conn = (HttpURLConnection) uri.openConnection();// 设置从主机读取数据超时
			conn.setReadTimeout(10 * 1000);
			conn.setDoInput(true);
			conn.setDoOutput(true);
			conn.setUseCaches(false);
			conn.setRequestMethod("POST");
			conn.setRequestProperty("connection", "keep-alive");
			conn.setRequestProperty("Charset", "UTF-8");
			conn.setRequestProperty("Content-Type", MULTIPART_FROM_DATA + ";boundary=" + BOUNDARY);

			// 首先组拼文本类型的参数
			StringBuilder sb = new StringBuilder();
			for (Map.Entry<String, String> entry : params.entrySet()) {
				sb.append(PREFFIX);
				sb.append(BOUNDARY);
				sb.append(LINEND);
				sb.append(
						"Content-Disposition: form-data; name=\"" + entry.getKey() + "\"" + LINEND);
				sb.append("Content-Type: text/plain; charset=" + CHARSET + LINEND);
				sb.append("Content-Transfer-Encoding: 8bit" + LINEND);
				sb.append(LINEND);
				sb.append(entry.getValue());
				sb.append(LINEND);

			}

			DataOutputStream outStream = new DataOutputStream(conn.getOutputStream());
			outStream.write(sb.toString().getBytes(CHARSET));

			// 构建发送字符串数据
			if (is != null) {
				String fileName = params.get("FILE_NAME");
				StringBuilder sb1 = new StringBuilder();
				sb1.append(PREFFIX);
				sb1.append(BOUNDARY);
				sb1.append(LINEND);
				sb1.append(
						"Content-Disposition: form-data; name=\"addFiles\"; filename=\"" + fileName
								+ "\"" + LINEND);
				// Content-Type: image/jpeg;
				sb1.append("Content-Type: image/jpeg; charset=" + CHARSET + LINEND);
				sb1.append("mimetype: image/jpeg;" + LINEND);
				sb1.append("fieldname: addFiles;" + LINEND);
				sb1.append(LINEND);
				// 写入到输出流中
				outStream.write(sb1.toString().getBytes());

				// 将文件读入输入流中
				byte[] buffer = new byte[1024];
				int len = 0;
				// 写入输出流
				while ((len = is.read(buffer)) != -1) {
					outStream.write(buffer, 0, len);
				}
				is.close(); // 添加换行标志
				outStream.write(LINEND.getBytes());
			} // 请求结束标志
			byte[] end_data = (PREFFIX + BOUNDARY + PREFFIX + LINEND).getBytes();
			outStream.write(end_data); // 刷新发送数据
			outStream.flush(); // 得到响应码
			int res = conn.getResponseCode();

			// 上传成功返回200
			if (res == 200) {
				in = conn.getInputStream();
				int ch;
				sb2 = new StringBuilder(); // 保存数据
				while ((ch = in.read()) != -1) {
					sb2.append((char) ch);
				}
			}
			conn.disconnect();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return sb2 == null ? null : sb2.toString();
	}

	public static void main(String[] args) throws FileNotFoundException {
		File file = new File("C:\\Users\\DELL\\Desktop\\6901028116305.jpg");
		FileInputStream is = new FileInputStream(file);
		String id = "6901028116305";
		Map<String, String> params = new HashMap<String, String>();
		params.put("filePath", "images/business_stores_images/" + id);
		params.put("thumb", "1");
		params.put("delFiles", "1");
		params.put("FILE_NAME", id + file.getName().substring(file.getName().lastIndexOf(".")));
		params.put("ContentType", "");

		// long time = System.currentTimeMillis();
		// params.put("timeout", "60000");
		// params.put("time", "" + time);
		// params.put("uuid", MD5Util.MD5("dianda" + "_" + "123456" + "_" +
		// time));

		String imgresult = uplaod("http://211.152.32.59:3911/ftp/images", params, is);
		System.out.println(imgresult);
	}

}
