package com.shengyibao.mongodb;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;

import com.mongodb.gridfs.GridFSDBFile;
import com.mongodb.gridfs.GridFSFile;

/**
 * 
 *<li>模块名 : MongodbClientHelper<br />
 *<li>文件名 : MongodbClientHelper.java<br />
 *<li>创建时间 : 2017年6月19日<br />
 *<li>实现功能 : 连接mongodb数据库的封装包，处理文件存储使用
 *<li><br />作者 : changyy
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年6月19日 v0.0.1 changyy 创建<br />
 */
public class MongodbClientHelper {

	@Resource
	private GridFsTemplate gridFsTemplate;
	@Resource
	private MongoTemplate mongoTemplate;

	// 处理文件
	public GridFSFile save(InputStream content, String fileName, String contentType) {
		return gridFsTemplate.store(content, fileName, contentType);
	}

	public GridFSFile save(InputStream content, String fileName) {
		return gridFsTemplate.store(content, fileName);
	}

	public InputStream read(String fileId) {
		Query query = Query.query(Criteria.where("_id").is(new ObjectId(fileId)));
		GridFSDBFile gridFile = gridFsTemplate.findOne(query);
		if (gridFile == null) {
			return null;
		}
		return gridFile.getInputStream();
	}

	public void deleteTestFiles(String fileId) {
		Query query = Query.query(Criteria.where("_id").is(new ObjectId(fileId)));
		gridFsTemplate.delete(query);
	}

	// 文档处理
	public void insert(Object obj, String collectionName) {
		mongoTemplate.insert(obj, collectionName);
	}

	public Object findOne(Map<String, Object> params, String collectionName) {
		return mongoTemplate.findOne(
				new Query(Criteria.where("id").is(params.get("id"))), Object.class, collectionName);
	}

	public List<Object> findAll(Map<String, Object> params, String collectionName) {
		List<Object> result = mongoTemplate.find(
				new Query(Criteria.where("age").lt(params.get("maxAge"))), Object.class,
				collectionName);
		return result;
	}

	public void update(Map<String, Object> params, String collectionName) {
		mongoTemplate.upsert(
				new Query(Criteria.where("id").is(params.get("id"))),
				new Update().set("name", params.get("name")), Object.class, collectionName);
	}

	public void createCollection(String name) {
		mongoTemplate.createCollection(name);
	}

	public void remove(Map<String, Object> params, String collectionName) {
		mongoTemplate.remove(
				new Query(Criteria.where("id").is(params.get("id"))), Object.class, collectionName);
	}

}
