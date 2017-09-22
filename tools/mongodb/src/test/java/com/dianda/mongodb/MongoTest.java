package com.dianda.mongodb;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Set;

import javax.annotation.Resource;

import org.bson.types.ObjectId;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.mongodb.DB;
import com.mongodb.Mongo;
import com.mongodb.gridfs.GridFSDBFile;
import com.mongodb.gridfs.GridFSFile;
import com.shengyibao.mongodb.bean.User;

/**
 * Unit test for simple App.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:mongodb.xml" })
public class MongoTest {

	@Resource
	private MongoTemplate mongoTemplate;
	@Resource
	private GridFsTemplate gridFsTemplate;

	@Test
	public void conn() {
		try {
			// 连接到 mongodb 服务
			Mongo mongo = new Mongo("127.0.0.1", 27017);
			// 根据mongodb数据库的名称获取mongodb对象 ,
			DB db = mongo.getDB("test");
			Set<String> collectionNames = db.getCollectionNames();
			// 打印出test中的集合
			for (String name : collectionNames) {
				System.out.println("collectionName===" + name);
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Test
	public void mongoconn() {
		try {
			Set<String> collectionNames = mongoTemplate.getCollectionNames();
			// 打印出test中的集合
			for (String name : collectionNames) {
				System.out.println("collectionName===" + name);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Test
	public void createcollect() {
		try {
			mongoTemplate.createCollection("hello");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Test
	public void createinsert() {
		try {
			User user = new User();
			user.setId("2");
			user.setAge(2);
			user.setName("zcy");
			user.setPassword("zcy");
			mongoTemplate.insert(user, "hello");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Test
	public void gridFsStore() {
		try {
			FileInputStream file = new FileInputStream("C:\\Users\\DELL\\Desktop\\java服务端架构.pptx");
			GridFSFile gfsf = gridFsTemplate.store(file, "file");
			Object id = gfsf.getId();
			System.out.println(id);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Test
	public void gridFsQuery() {
		try {
			Query query =
					Query.query(Criteria.where("_id").is(new ObjectId("594b23659998229ab0697d17")));
			GridFSDBFile gridFile = gridFsTemplate.findOne(query);
			InputStream is = gridFile.getInputStream();
			FileOutputStream fos =
					new FileOutputStream("C:\\Users\\DELL\\Desktop\\java服务端架构1.pptx");

			byte[] b = new byte[1024];
			while ((is.read(b)) != -1) {
				fos.write(b);
			}
			is.close();
			fos.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Test
	public void gridFsDel() {
		try {
			Query query =
					Query.query(Criteria.where("_id").is(new ObjectId("59479fecabab758fe3e2b4c6")));
			gridFsTemplate.delete(query);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
