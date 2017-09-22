package com.shengyibao.elasticsearch;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;

/**
 * 
 *<li>模块名 : ESClientHelper<br />
 *<li>文件名 : ESClientHelper.java<br />
 *<li>创建时间 : 2017年5月6日<br />
 *<li>实现功能 : 用于ES数据库的连接池管理
 *	使用  Transport Client的形式连接ES集群
 *<li><br />作者 : jessechen
 *<li><br />版本 : v0.0.1
 *<li><br />---------------------------------------------
 *<li><br />修改记录:
 *<li><br />日 期 版本 修改人 修改内容<br />
 *<li>2017年5月6日 v0.0.1 jessechen 创建<br />
 *<li>2017年5月15日 v0.0.1 changyy 重构<br />
 */
public class ESClientHelper {

	private Settings setting;

	private Map<String, Client> clientMap = new ConcurrentHashMap<String, Client>();

	private Map<String, Integer> ips = new HashMap<String, Integer>();

	private String clusterName;

	private String eshost;
	private Integer essocket;
	private Integer shards;
	private Integer replicas;

	public ESClientHelper() {
	}

	public ESClientHelper(String clusterName, String eshost, Integer essocket) {
		this.clusterName = clusterName;
		this.eshost = eshost;
		this.essocket = essocket;
		init();
	}

	public ESClientHelper(
			String clusterName, String eshost, Integer essocket, Integer shards, Integer replicas) {
		this.clusterName = clusterName;
		this.eshost = eshost;
		this.essocket = essocket;
		this.shards = shards;
		this.replicas = replicas;
		init();
	}

	public static final ESClientHelper getInstance() {
		return ClientHolder.INSTANCE;
	}

	private static class ClientHolder {
		private static final ESClientHelper INSTANCE = new ESClientHelper();
	}

	/**
	 * 
	 *功 能： 初始化默认的client<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月6日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------	void
	 */
	public void init() {
		ips.put(eshost, essocket);
		setting = Settings
				.settingsBuilder().put("index.number_of_shards", shards)
				.put("index.number_of_replicas", replicas).put("cluster.name", clusterName)
				// 设置集群名
				// .put("client.transport.sniff", true)
				// 开启嗅探 ,
				// 开启后会一直连接不上,
				// 原因未知
				.put("network.host", eshost).put("client.transport.ignore_cluster_name", true) // 忽略集群名字验证,
																								// 打开后集群名字不对也能连接上
				// .put("client.transport.nodes_sampler_interval", 5)
				// //报错,
				// .put("client.transport.ping_timeout", 5) // 报错,
				// ping等待时间,
				.build();
		addClient(setting, getAllAddress(ips));
	}

	/**
	 * 
	 *功 能： 获得所有的地址端口<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月6日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param ips
	 *@return	List<InetSocketTransportAddress>
	 */
	public List<InetSocketTransportAddress> getAllAddress(Map<String, Integer> ips) {
		List<InetSocketTransportAddress> addressList = new ArrayList<InetSocketTransportAddress>();
		for (String ip : ips.keySet()) {
			InetAddress ad = null;
			try {
				ad = InetAddress.getByName(ip);
			} catch (UnknownHostException e) {
				e.printStackTrace();
			}
			addressList.add(new InetSocketTransportAddress(ad, ips.get(ip)));
		}
		return addressList;
	}

	public Client getClient() {
		return getClient(clusterName);
	}

	public Client getClient(String clusterName) {
		return clientMap.get(clusterName);
	}

	/**
	 * 
	 *功 能： 将生成的Transport Client加入连接池<br />
	 *
	 *<br />----------------------------------------------------------------<br />
	 *修改记录 ：<br />
	 *日 期  版本 修改人 修改内容<br />
	 *2017年5月6日 v0.0.1 jessechen 创建<br />
	 *<br />----------------------------------------------------------------
	 *@param setting
	 *@param transportAddress	void
	 */
	public void addClient(Settings setting, List<InetSocketTransportAddress> transportAddress) {
		Client client = TransportClient.builder().settings(setting).build().addTransportAddress(
				new InetSocketTransportAddress(new InetSocketAddress(eshost, essocket)));
		clientMap.put(setting.get("cluster.name"), client);
	}

	public String getClusterName() {
		return clusterName;
	}

	public void setClusterName(String clusterName) {
		this.clusterName = clusterName;
	}

	public String getEshost() {
		return eshost;
	}

	public void setEshost(String eshost) {
		this.eshost = eshost;
	}

	public Integer getEssocket() {
		return essocket;
	}

	public void setEssocket(Integer essocket) {
		this.essocket = essocket;
	}

	public Settings getSetting() {
		return setting;
	}

	public void setSetting(Settings setting) {
		this.setting = setting;
	}

}
