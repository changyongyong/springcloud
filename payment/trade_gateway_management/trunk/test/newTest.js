/**
 * Created by SEELE on 2017/8/4.
 */
// {"name":"南京二-商城","outSystem":"global_server","outType":"商城预付款，订单服务，第三方，加盟商","outId":"320190","data":[]}

require('../utils/loadConfig');
const Promise = require('bluebird');

const server = require('../service/bind/bind');
const {Account} = require('../models/tradeGatewayDb');

const key = {
    "南京市":"320100",
    "南京市江宁区":"320115",
    "无锡市":"320200",
    "徐州市":"320300",
    "常州市":"320400",
    "常州南":"320450",
    "苏州市":"320500",
    "南通市":"320600",
    "扬州市":"321000",
    "泰州市":"321200",
    "盐城市":"320900",
    "泰州高岗":"321290",
    "泰州姜堰":"321280",
    "苏州餐饮":"320590",
    "上海高桥":"310900",
    "南通开发区":"320690",
    "南京秦淮":"320180",
    "上海川沙":"310800",
    "张家港市":"320501",
    "苏州姑苏":"320502",
    "常州金坛":"320490",
    "宁波市":"330200",
    "南通通州":"320601",
    "杭州余杭":"330101",
    "重庆市":"500100",
    "淮安市":"320800",
    "景德镇市":"360200",
    "昆山市":"320504",
    "江阴市":"320201",
    "南通海安":"320602",
    "湖州市":"330500",
    "宿迁市":"321300",
    "赣州市":"360700",
    "吉安市":"360800",
    "瑞金市":"361200",
    "宁乡市":"431400",
    "南通海门":"321400",
    "嘉兴市":"330400"
};

function getSecret() {

    Account.findAll({
        raw: true
    })
        .then((row)=> {
            let i, arr = [];
            for (i = 0; i < row.length; i++) {
                arr.push({
                    id: row[i].id,
                    name: row[i].name,
                    outId: row[i].outId,
                    outType: row[i].outType,
                    outSystem: row[i].outSystem,
                    token: Account.encrypt(row[i]),
                    accountId: row[i].accountId
                })
            }
            console.log(JSON.stringify(arr))
        })
}

getSecret();