package com.dianda.elasticsearch;

import java.net.InetSocketAddress;

import org.elasticsearch.action.admin.indices.exists.indices.IndicesExistsRequest;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

/**
 * Unit test for simple App.
 */
public class AppTest extends TestCase {
	/**
	 * Create the test case
	 *
	 * @param testName name of the test case
	 */
	public AppTest(String testName) {
		super(testName);
	}

	/**
	 * @return the suite of tests being tested
	 */
	public static Test suite() {
		return new TestSuite(AppTest.class);
	}

	/**
	 * Rigourous Test :-)
	 */
	public void testApp() {
		assertTrue(true);
	}

	public static void main(String[] args) {
		Settings setting = Settings
				.settingsBuilder().put("index.number_of_shards", 8)
				.put("index.number_of_replicas", 8)
				.put("client.transport.ignore_cluster_name", true) // 忽略集群名字验证,
				.build();
		Client client = TransportClient.builder().settings(setting).build().addTransportAddress(
				new InetSocketTransportAddress(new InetSocketAddress("116.228.89.150", 19211)));
		String indexName = "test";
		client
				.admin().indices().prepareCreate(indexName).setSettings(setting).execute()
				.actionGet().isAcknowledged();
		System.out.println("创建一个索引成功,索引名：{}" + indexName);

		boolean result = client
				.admin().indices()
				.exists(new IndicesExistsRequest().indices(new String[] { indexName })).actionGet()
				.isExists();
		System.out.println(result);
	}
}
