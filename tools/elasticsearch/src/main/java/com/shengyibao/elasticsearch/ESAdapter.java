package com.shengyibao.elasticsearch;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.ExecutionException;

import org.elasticsearch.action.admin.indices.exists.indices.IndicesExistsRequest;
import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.delete.DeleteResponse;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.get.MultiGetItemResponse;
import org.elasticsearch.action.get.MultiGetResponse;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.update.UpdateRequest;
import org.elasticsearch.action.update.UpdateResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.geo.GeoPoint;
import org.elasticsearch.common.unit.DistanceUnit;
import org.elasticsearch.index.get.GetField;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.script.Script;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHitField;
import org.elasticsearch.search.SearchHits;
import org.elasticsearch.search.aggregations.AbstractAggregationBuilder;
import org.elasticsearch.search.aggregations.AggregationBuilder;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.range.Range;
import org.elasticsearch.search.sort.SortBuilder;
import org.elasticsearch.search.suggest.SuggestBuilder.SuggestionBuilder;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

/**
 * 
 *<li>模块名 : ESAdapter<br />
 *<li>文件名 : ESAdapter.java<br />
 *<li>创建时间 : 2017年5月6日<br />
 *<li>实现功能 : 与ES实现连接，进行ES数据的增删改查
 *使用ES官方的Java API进行数据查询
 *<li><br />作者 : jessechen
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年5月6日 v0.0.1 jessechen 创建<br />
 *<li>2017年5月15日 v0.0.1 changyy 重构<br />
 */
public class ESAdapter {

	ESClientHelper eSClientHelper;

	public ESAdapter() {
	}

	public ESAdapter(ESClientHelper eSClientHelper) {
		this.eSClientHelper = eSClientHelper;
	}

	/**
	 * 
	 *功 能：单条数据单表插入 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月6日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index 类似DB
	 *@param type 类似TABLE
	 *@param id 我方生成的唯一ID
	 *@param json 符合要插入的数据的JSON格式
	 *@return 如果插入成功，将返回TRUE，否则FALSE
	 *@throws Exception	boolean
	 */
	public boolean add(String index, String type, String id, String json) throws Exception {
		Client client = eSClientHelper.getClient();
		// 查询索引是否存在
		boolean result = client
				.admin().indices()
				.exists(new IndicesExistsRequest().indices(new String[] { index })).actionGet()
				.isExists();
		if (!result) {// 不存在，添加
			client
					.admin().indices().prepareCreate(index).setSettings(eSClientHelper.getSetting())
					.execute().actionGet().isAcknowledged();
		}
		// 存json入索引中
		IndexResponse response =
				client.prepareIndex(index, type, id).setSource(json).execute().actionGet();
		return response.isCreated();
	}

	/**
	 * 
	 *功 能：单条数据单表插入（无ID） <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月6日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index 类似DB
	 *@param type 类似TABLE
	 *@param json 符合要插入的数据的JSON格式
	 *@return 如果插入成功，将返回TRUE，否则FALSE
	 *@throws Exception	boolean
	 */
	public boolean add(String index, String type, String json) throws Exception {
		Client client = eSClientHelper.getClient();
		// 查询索引是否存在
		boolean result = client
				.admin().indices()
				.exists(new IndicesExistsRequest().indices(new String[] { index })).actionGet()
				.isExists();
		if (!result) {// 不存在，添加
			client
					.admin().indices().prepareCreate(index).setSettings(eSClientHelper.getSetting())
					.execute().actionGet().isAcknowledged();
		}
		// 存json入索引中
		IndexResponse response =
				client.prepareIndex(index, type).setSource(json).execute().actionGet();
		return response.isCreated();
	}

	/**
	 * 
	 *功 能： 根据ID查找单条数据<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月6日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param id
	 *@return	String 返回数据的json格式
	 */
	public String getById(String index, String type, String id) {
		GetResponse response =
				eSClientHelper.getClient().prepareGet(index, type, id).setOperationThreaded(false) // 线程安全
						.get();
		return response.getSourceAsString();
	}

	/**
	 * 
	 *功 能： 根据多ID查找数据<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月10日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param ids
	 *@return	String
	 */
	public String getByMulitIds(String index, String type, String[] ids) {
		MultiGetResponse multiGetResponse =
				eSClientHelper.getClient().prepareMultiGet().add(index, type, ids).get();
		JSONObject jsonResult = new JSONObject();
		JSONArray jArray = new JSONArray();
		int totalCount = 0;
		for (MultiGetItemResponse itemResponse : multiGetResponse) {
			GetResponse response = itemResponse.getResponse();
			if (response != null && response.isExists()) {
				jArray.add(response.getSource());
				totalCount++;
			}
		}
		jsonResult.put("totalCount", totalCount);
		jsonResult.put("data", jArray);
		// SearchResponse searchResponse =
		// ESClientHelper
		// .getInstance().getClient().prepareSearch(index).setTypes(type)
		// .setQuery(queryBuilder).setFrom(pageIndex).setSize(pageSize).get();
		// SearchHits searchHits = searchResponse.getHits();
		// JSONObject jsonResult = new JSONObject();
		// JSONArray jArray = new JSONArray();
		// for (SearchHit hit : searchHits) {
		// if (hit.getSource() != null) {
		// JSONObject source = JSONObject.parseObject(hit.getSourceAsString());
		// source.put("id", hit.getId());
		// jArray.add(source);
		// }
		// }
		// jsonResult.put("totalCount", searchResponse.getHits().totalHits());
		// jsonResult.put("data", jArray);
		return jsonResult.toJSONString();
	}

	// public String getByMulitIdsAndQueryBuilder(
	// String index, String type, String[] ids, QueryBuilder queryBuilder) {
	// MultiGetResponse multiGetResponse =
	// ESClientHelper
	// .getInstance().getClient().prepareMultiGet().add(index, type, ids).get();
	// JSONObject jsonResult = new JSONObject();
	// JSONArray jArray = new JSONArray();
	// ESClientHelper
	// .getInstance().getClient().prepareSearch("").setQuery(queryBuilder).
	// // int totalCount = 0;
	// // for (MultiGetItemResponse itemResponse : multiGetResponse) {
	// // GetResponse response = itemResponse.getResponse();
	// // if (response != null && response.isExists()) {
	// // jArray.add(response.getSource());
	// // totalCount++;
	// // }
	// // }
	// // jsonResult.put("totalCount", totalCount);
	// // jsonResult.put("data", jArray);
	//
	// // SearchResponse searchResponse =
	// // ESClientHelper
	// // .getInstance().getClient().prepareSearch(index).setTypes(type)
	// // .setQuery(queryBuilder).setFrom(pageIndex).setSize(pageSize).get();
	// // SearchHits searchHits = searchResponse.getHits();
	// // JSONObject jsonResult = new JSONObject();
	// // JSONArray jArray = new JSONArray();
	// // for (SearchHit hit : searchHits) {
	// // if (hit.getSource() != null) {
	// // JSONObject source = JSONObject.parseObject(hit.getSourceAsString());
	// // source.put("id", hit.getId());
	// // jArray.add(source);
	// // }
	// // }
	// // jsonResult.put("totalCount", searchResponse.getHits().totalHits());
	// // jsonResult.put("data", jArray);
	// return jsonResult.toJSONString();
	// }

	/**
	 * 
	 *功 能： 根据ID查找指定返回字段的单条数据<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月6日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param id
	 *@return	String 返回数据的json格式
	 */
	public String getByIdWithResultFileds(
			String index, String type, String id, String[] resultFileds) {
		if (resultFileds == null) {
			resultFileds = new String[] {};
		}
		GetResponse response = eSClientHelper
				.getClient().prepareGet(index, type, id).setFields(resultFileds)
				.setOperationThreaded(false) // 线程安全
				.get();
		JSONObject jsonResult = new JSONObject();
		Iterator<GetField> iterator = response.iterator();
		while (iterator.hasNext()) {
			GetField hitfield = iterator.next();
			jsonResult.put(hitfield.getName(), hitfield.getValue());
		}
		return jsonResult.toJSONString();
	}

	/**
	 * 
	 *功 能： 多条件单表查询（默认10条数据）<br />
	 *由于传入条件逻辑和字段不定，所以直接传入组合后的QueryBuilder
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param queryBuilder
	 *@param pageIndex 每次查询的起始页
	 *@param pageSize 每次查询请求的数据量
	 *@return	String
	 */
	public String getMulitByQueryBuilder(String index, String type, QueryBuilder queryBuilder) {
		// SearchResponse searchResponse =
		// ESClientHelper
		// .getInstance().getClient().prepareSearch(index).setTypes(type)
		// .setQuery(queryBuilder).get();
		// SearchHits searchHits = searchResponse.getHits();
		// JSONObject jsonResult = new JSONObject();
		// JSONArray jArray = new JSONArray();
		// // int count = 0;
		// for (SearchHit hit : searchHits) {
		// // System.out.println(hit.getId() + " " + hit.getSourceAsString());
		// JSONObject source = JSONObject.parseObject(hit.getSourceAsString());
		// source.put("id", hit.getId());
		// jArray.add(source);
		// // count++;
		// }
		// jsonResult.put("count", searchResponse.getHits().totalHits());
		// jsonResult.put("datas", jArray);
		// return jsonResult.toJSONString();
		return getMulitByQueryBuilder(index, type, queryBuilder, 0, 10);
	}

	/**
	 * 
	 *功 能： 多条件单表查询<br />
	 *由于传入条件逻辑和字段不定，所以直接传入组合后的QueryBuilder
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param queryBuilder
	 *@param pageIndex 每次查询的起始页
	 *@param pageSize 每次查询请求的数据量
	 *@return	String
	 */
	public String getMulitByQueryBuilder(
			String index, String type, QueryBuilder queryBuilder, int pageIndex, int pageSize,
			SortBuilder... sortBuilders) {

		// SortBuilder sb = SortBuilders.fieldSort("XXX").order(SortOrder.DESC);

		SearchRequestBuilder builder = eSClientHelper
				.getClient().prepareSearch(index).setTypes(type).setQuery(queryBuilder)
				.setFrom(pageIndex).setSize(pageSize);

		if (sortBuilders != null && sortBuilders.length != 0) {
			for (int i = 0; i < sortBuilders.length; i++) {
				builder.addSort(sortBuilders[i]);
			}
		}
		SearchResponse searchResponse = builder.get();

		SearchHits searchHits = searchResponse.getHits();
		JSONObject jsonResult = new JSONObject();
		JSONArray jArray = new JSONArray();
		for (SearchHit hit : searchHits) {
			if (hit.getSource() != null) {
				JSONObject source = JSONObject.parseObject(hit.getSourceAsString());
				source.put("id", hit.getId());
				jArray.add(source);
			}
		}
		jsonResult.put("totalCount", searchResponse.getHits().totalHits());
		jsonResult.put("data", jArray);
		return jsonResult.toJSONString();
	}

	/**
	 * 
	 *功 能： 搜索建议查询<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年6月29日 v0.0.1 yuxy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param queryBuilder
	 *@param pageIndex
	 *@param pageSize
	 *@param suggestionsBuilder
	 *@return	String
	 */
	public String getMulitByQueryBuilderAndSuggestBuider(
			String index, String type, QueryBuilder queryBuilder, int pageIndex, int pageSize,
			SuggestionBuilder<?>... suggestionsBuilder) {

		SearchRequestBuilder builder = eSClientHelper
				.getClient().prepareSearch(index).setTypes(type).setQuery(queryBuilder);

		if (suggestionsBuilder != null && suggestionsBuilder.length != 0) {
			for (int i = 0; i < suggestionsBuilder.length; i++) {
				builder.addSuggestion(suggestionsBuilder[i]);
			}
		}

		builder.setFrom(pageIndex).setSize(pageSize);
		SearchResponse searchResponse = builder.get();

		SearchHits searchHits = searchResponse.getHits();
		JSONObject jsonResult = new JSONObject();
		JSONArray jArray = new JSONArray();
		for (SearchHit hit : searchHits) {
			if (hit.getSource() != null) {
				JSONObject source = JSONObject.parseObject(hit.getSourceAsString());
				source.put("id", hit.getId());
				jArray.add(source);
			}
		}
		jsonResult.put("totalCount", searchResponse.getHits().totalHits());
		jsonResult.put("data", jArray);
		return jsonResult.toJSONString();
	}

	/**
	 * 
	 *功 能：搜索关键词聚合高亮 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年6月30日 v0.0.1 yuxy 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param queryBuilder
	 *@param pageIndex
	 *@param pageSize
	 *@param suggestionsBuilder
	 *@return	String
	 */
	public String getMulitAndHighlightByQueryBuilder(
			String index, String type, QueryBuilder queryBuilder, int pageIndex, int pageSize,
			AbstractAggregationBuilder... aggs) {

		SearchRequestBuilder builder = eSClientHelper
				.getClient().prepareSearch(index).setTypes(type).setQuery(queryBuilder)
				.setFrom(pageIndex).setSize(pageSize).setHighlighterPreTags("<tags>")
				.setHighlighterPostTags("<tags>").addHighlightedField("title_ik_max")
				.addHighlightedField("title_ik_smart");

		if (aggs != null && aggs.length != 0) {
			for (int i = 0; i < aggs.length; i++) {
				builder.addAggregation(aggs[i]);
			}
		}

		SearchResponse searchResponse = builder.get();

		SearchHits searchHits = searchResponse.getHits();
		JSONObject jsonResult = new JSONObject();
		JSONArray jArray = new JSONArray();
		for (SearchHit hit : searchHits) {
			if (hit.getSource() != null) {
				JSONObject source = JSONObject.parseObject(hit.getSourceAsString());
				source.put("id", hit.getId());
				jArray.add(source);
			}
		}
		jsonResult.put("totalCount", searchResponse.getHits().totalHits());
		jsonResult.put("data", jArray);
		return jsonResult.toJSONString();
	}

	/**
	 * 
	 *功 能： 多条件单表查询，可指定返回字段<br />
	 *由于传入条件逻辑和字段不定，所以直接传入组合后的QueryBuilder
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月8日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param queryBuilder
	 *@param pageIndex 每次查询的起始页
	 *@param pageSize 每次查询请求的数据量
	 *@return	String
	 */
	public String getMulitByQueryBuilderWithResultFileds(
			String index, String type, QueryBuilder queryBuilder, int pageIndex, int pageSize,
			String[] resultFileds) {
		if (resultFileds == null) {
			resultFileds = new String[] {};
		}
		SearchResponse searchResponse = eSClientHelper
				.getClient().prepareSearch(index).setTypes(type).setQuery(queryBuilder)
				.setFrom(pageIndex).setSize(pageSize).addFields(resultFileds).get();
		SearchHits searchHits = searchResponse.getHits();
		JSONObject jsonResult = new JSONObject();
		JSONArray jArray = new JSONArray();
		for (SearchHit hit : searchHits) {
			Iterator<SearchHitField> iterator = hit.iterator();
			JSONObject json = new JSONObject();
			while (iterator.hasNext()) {
				SearchHitField hitfield = iterator.next();
				// System.out.print(hitfield.getName()+"=="+hitfield.getValue()+"-----");
				json.put(hitfield.getName(), hitfield.getValue());
			}
			jArray.add(json);
		}
		jsonResult.put("totalCount", searchResponse.getHits().totalHits());
		jsonResult.put("data", jArray);
		return jsonResult.toJSONString();
	}

	/**
	 * 
	 *功 能： 根据ID更新数据<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月6日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param id
	 *@param json	void
	 */
	public void updateById(String index, String type, String id, String json) {
		UpdateRequest data = new UpdateRequest(index, type, id).doc(json);
		try {
			// ShardInfo info =
			UpdateResponse response = eSClientHelper.getClient().update(data).get();
			System.out.println(11);
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}
		// 备用方式
		// XContentFactory
		// .jsonBuilder().startObject().field("dimensions", 2)
		// .field("exist", 2).endObject()

	}

	/**
	 * 
	 *功 能： 根据ID更新数据，有返回值<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月11日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param id
	 *@param json
	 *@return	Integer 返回成功的更新数量
	 */
	public boolean updateByIdHasResult(String index, String type, String id, String json) {
		UpdateRequest data = new UpdateRequest(index, type, id).doc(json);
		try {
			UpdateResponse response = eSClientHelper.getClient().update(data).get();
			if (response != null && response.getShardInfo() != null
					&& response.getShardInfo().getTotal() == response.getShardInfo().getSuccessful()
					&& response.getShardInfo().getTotal() > 0)
				return true;
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}
		return false;
	}

	/**
	 * 
	 *功 能：根据ID更新数据可使用脚本带入<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月11日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param id
	 *@param script	void ex:"ctx._source.gender = \"male\""
	 */
	public boolean updateByIdWithScript(String index, String type, String id, String script) {
		UpdateRequest data = new UpdateRequest(index, type, id).script(new Script(script));
		try {
			UpdateResponse response = eSClientHelper.getClient().update(data).get();
			if (response != null && response.getShardInfo() != null
					&& response.getShardInfo().getTotal() == response.getShardInfo().getSuccessful()
					&& response.getShardInfo().getTotal() > 0)
				return true;
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}
		// 备用方式
		// XContentFactory
		// .jsonBuilder().startObject().field("dimensions", 2)
		// .field("exist", 2).endObject()
		return false;
	}

	/**
	 * 
	 *功 能：更新数据时可插入没有的字段(INDEX) <br />
	 *如果有此字段则更新，如果没有此字段则在此ID的记录中添加新字段
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月19日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param id
	 *@param json	void
	 */
	public void upsert(String index, String type, String id, String json) {
		// IndexRequest indexRequest = new IndexRequest(index, type,
		// id).source(json);
		UpdateRequest updateRequest = new UpdateRequest(index, type, id).doc(json);
		try {
			ESClientHelper.getInstance().getClient().update(updateRequest).get();
		} catch (InterruptedException | ExecutionException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 
	 *功 能：根据输入的经纬度检索附近区域的店铺 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月10日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------	void
	 */
	public void getDistanceBetweenGeoLocation(double lat, double lon, int distance) {
		AggregationBuilder aggregation = AggregationBuilders
				.geoDistance("stores_location_v1").field("location").point(new GeoPoint(lat, lon))
				.unit(DistanceUnit.METERS).addUnboundedTo(3.0).addRange(3.0, 10.0)
				.addRange(10.0, 500.0);
		// sr is here your SearchResponse object
		SearchResponse sr = eSClientHelper
				.getClient().prepareSearch("stores_location_v1").setTypes("location_info")
				.addAggregation(aggregation).execute().actionGet();
		Range agg = sr.getAggregations().get("stores_location_v1");

		// For each entry
		for (Range.Bucket entry : agg.getBuckets()) {
			String key = entry.getKeyAsString(); // key as String
			Number from = (Number) entry.getFrom(); // bucket from value
			Number to = (Number) entry.getTo(); // bucket to value
			long docCount = entry.getDocCount(); // Doc count
			System.out.println(
					"key: " + key + " from: " + from + " to: " + to + " docCount: " + docCount);
		}
	}

	/**
	 * 
	 *功 能：批量插入操作 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月12日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param json 
	 *@return	List 返回带有成功插入的ID列表，还没有全部完成。暂时根据此列表size来判断批量插入是否成功
	 */
	public List bulkCreateHasResults(String index, String type, String[] json) {
		Client client = eSClientHelper.getClient();
		BulkRequestBuilder bulkRequest = client.prepareBulk();
		// boolean isSuccess = false;
		for (int i = 0; i < json.length; i++) {
			bulkRequest.add(client.prepareIndex(index, type).setSource(json[i]));
		}
		BulkResponse bulkResponse = bulkRequest.execute().actionGet();
		if (bulkResponse.hasFailures()) {
			// return false;
		}
		List resultIds = new ArrayList<String>();
		for (int j = 0; j < bulkResponse.getItems().length; j++) {
			if (bulkResponse.getItems()[j].getResponse() != null
					&& bulkResponse.getItems()[j].getResponse().getShardInfo().getTotal() > 0) {
				if (bulkResponse.getItems()[j]
						.getResponse().getShardInfo().getTotal() == bulkResponse.getItems()[j]
								.getResponse().getShardInfo().getSuccessful()) {
					resultIds.add("");
				}
			}
		}
		return resultIds;
		// return true;
	}

	/**
	 * 
	 *功 能：删除单条数据 测试用 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月12日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param index
	 *@param type
	 *@param id
	 *@return	boolean 返回值暂无效每次都是true
	 */
	public boolean deleteById(String index, String type, String id) {
		DeleteResponse response = eSClientHelper.getClient().prepareDelete(index, type, id).get();
		if (response != null && response.getShardInfo() != null
				&& response.getShardInfo().getTotal() == response.getShardInfo().getSuccessful()
				&& response.getShardInfo().getTotal() > 0)
			return true;
		else
			return false;
	}

	/**
	 * 测试用于生成的JSON
	 *功 能： <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月6日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@return	JSONObject
	 */
	public static JSONObject createJson() {
		JSONObject json = new JSONObject();
		json.put("keyword", "金典5");
		json.put("state", 1);
		json.put("exist", 1);
		json.put("pinyin", "jindian");
		json.put("initial", "j5");
		return json;
	}

	/**
	 * 
	 *功 能：测试用，大家熟悉后可删除 <br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月6日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param args
	 *@throws Exception	void
	 */
	public static void main(String[] args) throws Exception {

		ESClientHelper helper = new ESClientHelper("es2.3.4", "116.228.89.150", 19211, 1, 0);
		ESAdapter es = new ESAdapter(helper);
		// 添加一条数据
		// System.out.println(es.add("test", "keyword_info", "1",
		// createJson().toJSONString()));
		// System.out.println(createJson().toJSONString());
		es.updateById("test", "keyword_info", "1", createJson().toJSONString());
		// es.deleteById("test", "keyword_info", "1");
		// ID查询无指定字段
		// System.out.println(es.getById("stores_goods_v1", "info",
		// "12150601"));
		// System.out.println(es.getByIdWithResultFileds(
		// "stores_goods_v1", "info", "26853725", (new String[] { "title" })));
		//
		// String[] ids =
		// new String[] { "26853715", "26853716", "26853715", "26853715",
		// "26853715",
		// "26853715", "26853715", "26853715", "26853715", "26853715",
		// "26853715", };
		// System.out.println(es.getByMulitIds("stores_goods_v1", "info", ids));
		// 多条件查询
		// QueryBuilder qb =
		// QueryBuilders.boolQuery().must(QueryBuilders.termQuery("state",
		// "10"))
		// // .must(QueryBuilders.termQuery("capacity", "10"))
		// // .must(QueryBuilders.rangeQuery("store_id").gt(108249).lt(108549));
		// ;
		// System.out.println(es.getMulitByQueryBuilderWithResultFileds(
		// "business_stores_v1", "info", qb, 1, 15, (new String[] { "store_id"
		// })));

		// 修改
		// es.updateByIdHasResult(
		// "goods_keyword_v1", "keyword_info", "5",
		// "{\"dimensions\":\"53\",\"exist\":53}");
		// es.getDistanceBetweenGeoLocation();

		// 批量处理
		// String[] json = new String[] { "{\"_id\":\"6\",\"dimensions\":6}",
		// "{\"dimensions\":7}" };
		// System.out.println(es.bulkCreateHasResults("goods_keyword_v1",
		// "keyword_info", json));

		// 删除161657
		// System.out.println(es.deleteById("business_stores_v1", "_id",
		// "145575"));
	}

	public ESClientHelper geteSClientHelper() {
		return eSClientHelper;
	}

	public void seteSClientHelper(ESClientHelper eSClientHelper) {
		this.eSClientHelper = eSClientHelper;
	}

}
