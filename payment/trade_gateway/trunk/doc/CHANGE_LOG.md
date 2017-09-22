
_2017年7月3日_
1. 支付参数中的source去掉
2. 退款请求中的orignial改为original
3. 付款退款转账请求增加accountId，为从支付管理系统设置的accountId
4. 付款退款转账请求增加sign，计算方式为
    4.1 第一步，设所有发送或者接收到的数据为集合M，将集合M内非空参数值的参数按照参数名ASCII码从小到大排序（字典序），使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串stringA。
    - 特别注意以下重要规则：
    - 参数名ASCII码从小到大排序（字典序）；
    - 如果参数的值为空不参与签名；
    - 参数名区分大小写；
    - 验证调用返回或主动通知签名时，传送的sign参数不参与签名，将生成的签名与该sign值作校验。
    - 接口可能增加字段，验证签名时必须支持增加的扩展字段
    4.2 在stringA最后拼接上key得到stringSignTemp字符串，并对stringSignTemp进行MD5运算，再将得到的字符串所有字符转换为大写，得到sign值signValue。