/**
 * Created by zrz on 2015/3/10，17:01.创建zrz工具箱，名称暂定为zBox，为便于调用，特全部小写，即为：zbox.
 * @version 1.0.0 created . 新增一个方便添加全选和单选相互触发的自定义函数selectAll。
 * @version 1.0.1 updated . 重新定义selectAll的选择器。更为方便的指定单选组和全选按钮的选择事件。
 * @version 1.0.2 created . 新增反选按钮与单选按钮的触发事件绑定。
 * @version 1.0.3 created . 新增日期的格式化。
 * @version 1.0.4 created . 新增金额的格式化，新增一个String的对象原形引用trim。
 * @version 1.0.5 created . 新增getKeyList函数，获取json对象的key数组
 * @version 1.0.6 created . 新增eleIsVisible函数，获取ele元素是否显示在当前窗口
 * @version 1.0.7 created . 新增changeUrlKeyValue函数替换指定url中key的value
 * @version 1.0.8 created . 新增a元素到b元素的动画效果，可自定义动画效果
 * @version 1.0.9 created . 新增getJsonLength函数，获取json对象类型的长度
 * @version 1.0.10 created .新增checkboxSync函数，用于两个checkbox的同步
 */
(function (z) {
    /**
     * 将数组或对象装换为select option html
     * @param obj @type object||array 数组或者对象
     * 当为array obj[key]===string options的显示为obj[key]，value 为obj[key]
     *           obj[key]===object options的显示为obj[_key].label || obj[_key].name，value 为obj[_key].value
     * 当为object obj[key]===string options的显示为obj[key]，value 为key
     *            obj[key]===object options的显示为obj[_key].label || obj[_key].name||key，value 为obj[_key].value||key
     * @param options @type object||null
     * @returns {string}
     */
    var toSelectOptionsHtml = function (obj, options) {
        var _key;
        var _value;
        var _label;
        var _selected;
        var _domHtml = '';
        if (typeof options !== 'object') {
            options = {};
        }
        for (_key in obj) {
            if (!obj.hasOwnProperty(_key)) {
                continue;
            }
            if (typeof obj[_key] === "string") {
                _label = obj[_key];
                if (Array.isArray(obj)) {
                    _value = obj[_key];
                } else {
                    _value = _key;
                }
            } else {
                _value = obj[_key].value || _key;
                _label = obj[_key].label || obj[_key].name || _key;
            }
            if (_value === options.selected) {
                _selected = ' selected ';
            } else {
                _selected = '';
            }
            _domHtml += '<option value="' + _value + '" ' + _selected + '>' + _label + '</option>'
        }
        return _domHtml;
    };
    z.zbox = {
        /**
         * 1.0.1 全选与单选事件触发
         * @param allCheck 全选的选择器
         * @param radioChecks 单选的选择器 (!!)此处的单选为多选按钮组checkbox的一个按钮
         */
        checkboxAll: function (allCheck, radioChecks) {
            //筛选单选按钮组
            var radioValueEles = $(radioChecks);
            //点击全选时，同组按钮被同步
            $(document).delegate(allCheck, "click", function () {
                if (radioValueEles && radioValueEles.length > 0) {
                    for (var _r = 0; _r < radioValueEles.length; _r++) {
                        radioValueEles[_r].checked = $(this)[0].checked;
                    }
                }
            });
            //点击单选按钮时，
            $(document).delegate(radioChecks, "click", function () {
                $(allCheck)[0].checked = $(radioChecks + ":checked").length == $(radioChecks).length;
            });
        },
        /**
         * 两个checkbox的按钮同步(不建议使用)
         * @param c0 第一个元素的选择器
         * @param c1 第二个元素的选择器
         */
        checkboxSync: function (c0, c1) {
            $(document).delegate(c0, "change", function () {
                $(c1)[0].checked = $(c0).is(":checked");
            });
            $(document).delegate(c1, "change", function () {
                $(c0)[0].checked = $(c1).is(":checked");
            });
        },
        /**
         * 1.0.2 反选与单选事件触发，可选择是否绑定全选按钮
         * @param inverseCheck 全选的选择器
         * @param radioChecks 单选checkbox的选择器
         * @param allCheck 反选的选择器
         */
        checkboxInverse: function (inverseCheck, radioChecks, allCheck) {
            //筛选单选按钮组
            var radioValueEles = $(radioChecks);
            $(document).delegate(inverseCheck, "click", function () {
                var allChecked = true;
                //点击反选时，同组按钮被反向选择
                if (radioValueEles && radioValueEles.length > 0) {
                    for (var _r = 0; _r < radioValueEles.length; _r++) {
                        if (radioValueEles.hasOwnProperty(_r)) {
                            radioValueEles[_r].checked = !radioValueEles[_r].checked;
                            allChecked &= radioValueEles[_r].checked;
                        }
                    }
                }
                //若有全选的触发，则检测全选按钮是否选中
                if (allCheck) {
                    $(allCheck)[0].checked = allChecked;
                }
            });
        },
        /**
         * 1.0.4 数字格式化为金额
         * @param s 数字
         * @param k 几位一断，即1,2345.0还是1,234.0
         * @param n 保留几位小数
         */
        number2Money: function (s, k, n) {
            n = n > 0 && n <= 20 ? n : 2;
            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            var l = s.split(".")[0].split("").reverse(),
                r = s.split(".")[1];
            t = "";
            for (i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % (k > 0 ? k : 3) == 0 && (i + 1) != l.length ? "," : "");
            }
            return t.split("").reverse().join("") + "." + r;
        },
        /**
         * 1.0.4 数字格式化为金额
         * @param s 数字
         * @param k 几位一断，即1,2345.0还是1,234.0
         * @param n 保留几位小数
         */
        number2MoneyWithoutCommas: function (s, k, n) {
            n = n > 0 && n <= 20 ? n : 2;
            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            var l = s.split(".")[0].split("").reverse(),
                r = s.split(".")[1];
            t = "";
            for (i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % (k > 0 ? k : 3) == 0 && (i + 1) != l.length ? "," : "");
            }
            return t.split("").reverse().join("") + "." + r;
        },
        /**
         * 1.0.4 数字格式化
         * @param src 数字
         * @param pos 保留几位小数
         */
        formatFloat: function (src, pos) {
            src = parseFloat(src);
            return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
        },
        /**
         * 1.0.4 金额还原为数字
         * @param m 金额
         * @returns {Number} 转换后的数字
         */
        money2Number: function (m) {
            return parseFloat(m.replace(/[^\d\.-]/g, ""));
        },
        /**
         * 1.0.5 getKeyList获取json的key数组
         * @param json
         * @returns {Array}
         */
        getKeyList: function (json) {
            var list = [];
            if (typeof json == "object") {
                for (var key in json) {
                    if (json.hasOwnProperty(key)) {
                        list.push(key);
                    }
                }
            }
            return list;
        },
        /**
         * 1.0.6 根据元素的在页面中的位置和当前窗口的位置判断元素是否显示
         * @param ele
         * @returns {boolean}
         */
        eleIsVisible: function (ele) {
            var boo = false;
            return boo;
        },
        /**
         * 1.0.7 替换url中对应key的value,若未找到该key，则添加key=value
         * @param url 目标url
         * @param arg 需要替换的参数名称
         * @param arg_val 替换后的参数的值
         * @returns {string} 参数替换后的url
         */
        changeURLKeyValue: function (url, arg, arg_val) {
            var pattern = arg + '=([^&]*)';
            var replaceText = arg + '=' + arg_val;
            if (url.match(pattern)) {
                var tmp = '/(' + arg + '=)([^&]*)/gi';
                tmp = url.replace(eval(tmp), replaceText);
                return tmp;
            } else {
                if (url.match('[/?]')) {
                    return url + '&' + replaceText;
                } else {
                    return url + '?' + replaceText;
                }
            }
        },
        a2bAnimate: function (e0, e1, css) {
            console.info(e0, e1)
            e0 = e0.clone()
                .css({
                    "position": "fixed",
                    "left": e0.offset().left,
                    "top": e0.offset().top,
                    "z-index": e0.css("z-index") || 1000
                });
            e0.animate(css || {
                    "position": "fixed",
                    "left": e1.offset().left,
                    "top": e1.offset().top,
                    "z-index": e1.css("z-index") || 1000
                })
        },
        getJsonLength: function (json) {
            var _n = 0;
            if (json && json.toString() != "{}") {
                for (var _j in json) {
                    if (json.hasOwnProperty(_j)) {
                        _n++;
                    }
                }
            }
            return _n;
        },
        warehousePosition: {
            getTypes: function () {
                return {
                    //拣货位
                    pickingPosition: "拣货位",
                    //存储位
                    storagePosition: "存储位",
                    //损耗位
                    lossPosition: "损耗位",
                    //分拣位
                    sortingPosition: "分拣位",
                    //出库中转位
                    outStagingPosition: "出库中转位",
                    //入库中转位
                    inStagingPosition: "入库中转位",
                    //订单拒收退货位
                    rejectionReturnPosition: "拒收退货位",
                    //收货后退货位
                    deliveryReturnPosition: "售后退货位",
                    //退供位
                    supplierReturnPosition: "退供位",

                    inventoryProfitPosition: "盘盈库位",
                    //盘亏位
                    inventoryLossPosition:"盘亏库位"
                }
            }
        },
        stockMove: {
            getTypes: function () {
                return {
                    onRack: '上架',
                    stockFull: '补货',
                    pickList: '拣货',
                    secondPick: '分拣',
                    normal: '正常移库',
                    wrongPosition: '库位错误',
                    loss: '损溢移库',
                    adjustDate: '效期调整'
                }
            }
        },
        toSelectOptionsHtml: toSelectOptionsHtml
    };
})
(jQuery, document);

//TODO 对象原型
//1.0.3 Date对象原型，format引用
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "w+": this.getDay(),//week
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) {//year
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};
//1.0.4 String对象原型，trim引用
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
};