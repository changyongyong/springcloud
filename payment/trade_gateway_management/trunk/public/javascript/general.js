//——————————【ajax】方法集合—————————————————
/**
 * ajax标准方法
 * @param method
 * @param url
 * @param data
 * @param loadingEleId
 * @param callback
 */
function ajax_load(method, url, data, loadingEleId, callback) {
    var loadingEle = $('#' + loadingEleId);
    if (loadingEleId && loadingEleId.length > 0) {
        onloading(loadingEle);
    }
    var reJson = '';
    $.ajax({
        type: method,
        timeout: 30000,
        url: url,
        dataType: 'json',
        data: data,
        success: function (json) {
            var tag = json.tag;
            if (tag) {
                reJson = json;
            } else {
                reJson = '';
            }
        },
        error: function (XMLHttpRequest) {
            $.sobox.alert('获取数据失败', '原因：' + XMLHttpRequest.status);
        },
        complete: function (XMLHttpRequest, status) {
            if (loadingEleId && loadingEleId.length > 0) {
                loaded(loadingEle);
            }
            callback(status, reJson);
        }
    });
}

function onloading(loadingEle) {
    loadingEle.fadeIn();
}

function loaded(loadingEle) {
    loadingEle.fadeOut();
}

function getCities(callback) {
    $.ajax({
        url: '/api/cities',
        method: 'GET',
        success: function (data) {
            if (data.tag === 'success') {
                var i;
                var map = {};
                for (i = 0;i < data.data.length; i++) {
                    map[data.data[i].cityId] = data.data[i].cityName
                }
                callback(null, map)
                // that.searchEle.cityId.append(objToOptions(map));
            }
            callback('error')
        }
    })
}

/**
 * 从url中获取name对应的参数值
 * @param name
 * @returns {*}
 */
function getUrlParamValue(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
}

/**
 * 参数值val是否为空，若空，alert(str)
 * @param val
 * @param str
 */
function checkValueIsNull(val, str) {
    if (val && val.length > 0) {
        return true;
    } else {
        alert(str);
        return false;
    }
}

/**
 * 延时函数，等待ms毫秒
 * @param ms
 */
function sleep(ms) {
    setTimeout('', ms);
}

/**
 * 格式化一个浮点数
 * @param float     浮点数本身
 * @param max       浮点数最多小数位数
 * @param toFixed   浮点数格式化后最多小数位数
 * @returns {*}
 */
function floatToFixed(float, max, toFixed) {
    if (!(toFixed && toFixed > 0)) {
        toFixed = 2;
    }
    if (max && max > 0) {
        toFixed = max;
    } else {
        max = 2;
    }
    //判断是否有小数点，即是否为浮点数
    if (float.toString().split('.').length > 1) {
        //判断小数点后位数
        if (float.toString().split('.')[1] >= Math.pow(10, max)) {
            return parseFloat(float).toFixed(toFixed);
        } else {
            return float;
        }
    } else {
        return float;
    }
}

//——————————【模态框】————————————————————
var setAlertModalT = -1;
/**
 * 设置弹出信息提示框
 * @param info 提示信息
 * @param timeOut 延迟日期
 * @param options 设置参数
 *        isNeedConfirm:true 显示确定取消按钮，当确定时回调函数中参数为true
 * @param callback 回调函数，当模态框关闭后调用此函数。当options.isNeedConfirm=true时，点击确定按钮将callback(true);否则将回调callback(false)
 */
function setAlertModal(info, timeOut, options, callback) {
    //    $('#alert-modal-cancel').click();//FIXME 处，加入此句后，同一页面不刷新，第二次弹窗会自动关闭
    var confirm = false;
    if (typeof options == 'function' && !callback) {
        callback = options;
    }
    if (typeof timeOut == 'function' && !callback) {
        callback = timeOut;
        timeOut = null;
    }
    if (typeof timeOut == 'object' && !options) {
        options = timeOut;
        timeOut = null;
    }
    if (!options) {
        options = {};
    }
    $('#alert-modal-info').html(info);
    if (options.isNeedConfirm) {
        $('#alert-modal .chose-buttons').show();
    } else {
        $('#alert-modal').find('.close').hide();
    }
    $('#alert-modal').modal('show');
    $('#alert-modal .chose-buttons [func=btn-confrim]').off('click');
    $('#alert-modal .chose-buttons [func=btn-confrim]').one('click', function () {
        confirm = true;
        $('#alert-modal').modal('hide');
    });
    $('#alert-modal .chose-buttons [func=btn-cancel]').off('click');
    $('#alert-modal .chose-buttons [func=btn-cancel]').one('click', function () {
        $('#alert-modal').modal('hide');
    });
    $('#alert-modal').one('hidden.bs.modal', function () {
        $('#alert-modal .chose-buttons').hide();
        $('#alert-modal #alert-modal-time').hide();
        if (typeof callback == 'function') {
            callback(confirm);
        }
    });
    if (timeOut) {
        $('#alert-modal-time').show().find('label').text(timeOut);
        if (setAlertModalT > 0) {
            clearTimeout(setAlertModalT);
        }

        function countDown() {
            var second = $('#alert-modal-time').find('label');
            setAlertModalT = setTimeout(function () {
                if (second.text() > 1) {
                    second.text(second.text() - 1);
                    countDown();
                } else {
                    $('#alert-modal-time').hide();
                    $('#alert-modal').modal('hide');
                }
            }, 1000);
        }

        countDown();
    }
    $('#alert-modal').modal('show');
    return !info;
}

var mapping = {
    STATUS: {
        SUCCESS: '成功',
        FAIL: '失败',
        PENDDING: '处理中'
    },
    SOURCE: {
        mAli: '支付宝-米洱',
        ddAli: '支付宝-店达',
        dd528: '微信-商城',
        wxmp: '微信-小程序',
        bsapp: '微信-生意宝',
        psapp: '微信-猪行侠'
    },
    SYSTEM: {
        DD_PAY: '账户系统',
        api_server: '订单系统',
        delivery_app: '配送系统',
        business_server: '生意宝',
        customer_api_server: '小程序',
        other:'其他'
    },
    PAYMENT_ORDER_TYPE: {
        // 'delivery_app|deposit': '猪行侠-充值押金',
         //'api_server|order': '店达商城-订单',
        // 'delivery_app|goods_pay': '配送交货款',
        // 'test|test': '测试',
        // 'business_server|corder': '小程序-订单',
        // 'business_server|corder': '生意宝-订单'


        // 'api_server,order': '店达商城-订单',
        // 'delivery_app,goods_pay': '猪行侠-交货款',
        // 'delivery_app,user_goods_pay': '猪行侠-用户扫描付',
        // 'DD_PAY,delivery_app|deposit': '猪行侠-押金充值',
        // 'DD_PAY,THIRD_SYSTEM|balance': '第三方-预存款充值',
        // 'customer_api_server,corder':'生意宝-小程序-订单',
        // 'business_server,border':'生意宝-订单',
        // 'business_server,B_ACCOUNT_BALANCE':'生意宝-主账户充值',
        // 'business_server,B_LIFE_ACCOUNT_BALANCE':'生意宝-生活服务户充值',
        // 'business_server,B_LIFE_ACCOUNT_BALANCE_APPLY':'生意宝-预约金充值',
        // 'business_server,B_LIFE_ACCOUNT_DES_APPLY':'生意宝-押金充值',
        // 'test,test':'测试',


        'mall':'商城',
        'mall:order':'|--订单',
        'delivery_app':'猪行侠',
        'delivery_app:goods_pay':'|--交货款',
        'delivery_app:user_goods_pay': '|--用户扫描付',
        'delivery_app:deposit': '|--押金充值',
        'third':'第三方',
        'third:balance': '|--预存款充值',
        'syb':'生意宝',
        'syb:corder':'|--小程序-订单',
        'syb,border':'|--门店-订单',
        'syb,B_ACCOUNT_BALANCE':'|--主账户充值',
        'syb,B_LIFE_ACCOUNT_BALANCE':'|--生活服务户充值',
        'syb,B_LIFE_ACCOUNT_BALANCE_APPLY':'|--预约金充值',
        'syb,B_LIFE_ACCOUNT_DES_APPLY':'|--押金充值',
        'test':'测试'
    },
    REFUND_ORDER_TYPE: {

    },
    TRANSFER_ORDER_TYPE: {
        withdrawCash: '提现',
        other: '其它'
    },
    MAIN_TRADE_CHANNEL: {
        WE_CHAT: '微信支付',
        ALI_PAY: '支付宝',
        other: '其它'
    },
    VALIDATE_STATUS:{
        '99':'已对账',
        '-99':'未对账'
    },
    VALIDATE_STATUS2:{
        '99':'正常',
        '-all':'异常',
        '-99':'|--金额不一致',
        '-98':'|--状态不一致',
        '-97':'|--记录丢失',
        '-1':'|--上游核验失败'
    },
    BUSINESS_TYPE:{
        'payment':'付款记录',
        'refund':'退款记录',
        'transfer':'转账记录',
    },
    ACCOUNT_SYSTEM: {
        global_server: 'global_server',
        business_server: 'business_server'
    }
};

function objToOptions(data) {
    var keys = Object.keys(data);
    var i;
    var html = '<option value="all">全部</option>';
    for (i = 0; i < keys.length; i++) {
        html += '<option value="' + keys[i] + '">' + data[keys[i]] + '</option>'
    }
    return html;
}

function objToOptions1(data) {
    var keys = Object.keys(data);
    var i;
    var html = '<option value="">请选择类型</option>';
    for (i = 0; i < keys.length; i++) {
        html += '<option value="' + keys[i] + '">' + data[keys[i]] + '</option>'
    }
    return html;
}