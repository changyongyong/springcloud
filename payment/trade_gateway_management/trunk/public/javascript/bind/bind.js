/**
 * Created by wt on 2017/7/6.
 */

var PAY_TYPE = ['ali_pay', 'ali_transfer', 'ali_app', 'wechat_pay', 'wechat_js_api','wechat_scan', 'wechat_app'];
var PAY_TYPE_OBJ = {
    ali_transfer: {name: '支付宝转账', key: 'ali_transfer'},
    ali_app: {name: '支付宝APP', key: 'ali_app'},
    ali_pay: {name: '支付宝', key: 'ali_pay'},
    wechat_pay: {name: '微信native', key: 'wechat_pay'},
    wechat_app: {name: '微信app', key: 'wechat_app'},
    wechat_js_api: {name: '微信jsapi', key: 'wechat_js_api'},
    wechat_scan: {name: '微信条码', key: 'wechat_scan'}
};
var TYPE = {
    'self': {name: '非服务商'},
    'server': {name: '服务商'}
};


var Bind = function (updateId) {
    this.updateData = [];
    this.data = [];
    this.configData = [];
    this.updateId = updateId;
    this.datatable = '';
    this.accountData = null;
};


Bind.prototype.start = function () {
    var _getUpdateData = this.getUpdateData;
    var _initData = this.initData;
    var _that = this;

    $('#system_name').append(objToOptions1(mapping.ACCOUNT_SYSTEM));

    ajax_load('get', '/api/bind/config',null, null, function (status, json) {
        if (status === 'success' && json.tag === 'success') {
            _that.configData = json.data;
            if (_that.updateId) {
                return _getUpdateData.call(_that, _that.updateId)
            }
            _initData.call(_that)
        } else {
            return setAlertModal(json.message)
        }
    })
};

Bind.prototype.getUpdateData = function (accountId) {
    var _initData = this.initData;
    var _that = this;
    var updateData = _that.updateData;
    ajax_load('get', '/api/bind/query?id=' + accountId, null, null, function (status, json) {
        if (status === 'success' && json.tag === 'success') {
            var i;
            var data = json.data;
            var accountMerchantArr = data.accountMerchant;
            var configIdJsonArr = data.configIdJsonArr;
            var accountData = data.account;
            _that.accountData = accountData;
            for (i = 0; i < accountMerchantArr.length; i++) {
                var tradeChannel = accountMerchantArr[i].tradeChannel;
                var tradeType = accountMerchantArr[i].tradeType;
                var accountType = accountMerchantArr[i].type;
                var channel = null;
                var type = null;
                var configSelfData = undefined;
                var configSeverData = undefined;
                if (tradeChannel === 'ALI_PAY') {
                    if (tradeType === 'ALI_PAY_TRANSFER') {
                        channel = 'ali_transfer'
                    } else if (tradeType === 'ALI_PAY_APP'){
                        channel = 'ali_app'
                    } else {
                        channel = 'ali_pay'
                    }
                }

                if (tradeChannel === 'WE_CHAT_PAY') {
                    if (tradeType === 'WE_CHAT_PAY_APP') {
                        channel = 'wechat_app'
                    } else if (tradeType === 'WE_CHAT_PAY_NATIVE') {
                        channel = 'wechat_pay'
                    } else if (tradeType === 'WE_CHAT_PAY_JSAPI') {
                        channel = 'wechat_js_api'
                    } else if (tradeType === 'WE_CHAT_PAY_SCAN_PAY') {
                        channel = 'wechat_scan'
                    }
                }
                if (accountType === 1) {
                    type = 'self';
                    configSelfData = configIdJsonArr[accountMerchantArr[i].merchantConfigId]
                }
                if (accountType === 2) {
                    type = 'server';
                    configSeverData = configIdJsonArr[accountMerchantArr[i].merchantConfigId]
                }
                updateData.push({
                    channel: channel,
                    type: type,
                    merchant: accountMerchantArr[i].tradeMerchantNo,
                    merchantName: accountMerchantArr[i].tradeMerchantName,
                    serverConfig: _.clone(configSeverData),
                    selfConfig: _.clone(configSelfData),
                    state: accountMerchantArr[i].state
                })
            }
            $('#account_name').val(accountData.name);
            $('#system_name').val(accountData.outSystem);
            $('#system_type').val(accountData.outType);
            $('#system_id').val(accountData.outId);
            $('#account_token').text(accountData.token);
            $('#account_uuid').text(accountData.accountId);
            if (!accountData.auth) {
                $('#auth_account_div').css('display', 'block');
                $('#account_auth').attr('href', accountData.url)
            }

            _initData.call(_that)
        } else {
            return setAlertModal(json.message)
        }
    })

};

Bind.prototype.initData = function () {
    var i;
    var updateData = this.updateData;
    var data = [];
    for (i = 0; i < PAY_TYPE.length; i++) {
        var updateInfo = _.find(updateData, function (par) {
            return par.channel === PAY_TYPE[i]
        });
        var type = null;
        var channel = null;
        var merchant = null;
        var merchantName = null;
        var serverConfig = null;
        var selfConfig = null;
        var test = null;
        var typeObj = _.cloneDeep(TYPE);
        var state = null;
        if (updateInfo) {
            type = updateInfo.type;
            channel = updateInfo.channel;
            merchant = updateInfo.merchant;
            merchantName = updateInfo.merchantName;
            serverConfig = updateInfo.serverConfig;
            selfConfig = updateInfo.selfConfig;
            test = true;
            state = updateInfo.state;
        }
        if (type) {
            typeObj[type].isUse = true;
        }
        if (!serverConfig && type === 'self') {
            serverConfig = {
                disable: true
            }
        }
        if (!selfConfig && type === 'server') {
            selfConfig = {
                disable: true
            }
        }
        data.push({
            type: typeObj,
            channel: channel && PAY_TYPE_OBJ[channel] || PAY_TYPE_OBJ[PAY_TYPE[i]],
            merchant: merchant,
            merchantName: merchantName,
            serverConfig: serverConfig,
            serverSelfConfig: selfConfig,
            test: test,
            state: state
        });
    }
    this.setTable('#main-table', data)
};

Bind.prototype.setTable = function (table, data) {
    var configData = this.configData;
    var accountData = this.accountData;
    var i;
    var aliData = [];
    var wxData = [];
    var updateId = this.updateId;

    for (i = 0; i < configData.length; i++) {
        if (configData[i].tradeChannel === 1) {
            aliData.push(configData[i])
        } else {
            wxData.push(configData[i])
        }
    }

    var dataTableOptions = {
        "stateSave": false,//不存储页数状态
        "searching": false,
        "autoWidth": false,
        "processing": true,
        "ordering": false,
        "serverSide": false, //服务器分页
        'data': data,
        columns: [
            {
                data: 'type',
                width: '13%',
                title: '模式',
                render: function (data) {
                    var _str = '';
                    var i;
                    _str += '<select class="form-control" name="account_type" style="width: 180px">';
                    _str += '<option value="">请选择模式</option>';
                    for (i in data) {
                        if (data[i].isUse) {
                            _str += '<option value="' + i + '" selected>' + data[i].name + '</option>'
                        } else {
                            _str += '<option value="' + i + '">' + data[i].name + '</option>'
                        }
                    }
                        // '<option value="">请选择类型</option>' +
                        // '<option value="self">自营</option>' +
                        // '<option value="server">服务商</option>' +
                    _str += '</select>';
                    return  _str
                }
            },
            {
                data: 'channel',
                width: '13%',
                title: '支付渠道',
                render: function (data) {
                    var _str = '';
                    _str += '<span>' + data.name + '</span>';
                    _str += '<input type="text" style="display: none" name="account_channel" value="' + data.key + '"/>';
                    return  _str
                }
            },
            {
                data: 'merchant',
                width: '13%',
                title: '商户号',
                render: function (data) {
                    var _str = '';
                    var __str = '';
                    if (arguments[2] && arguments[2]['type']['self']['isUse'] === true) {
                        __str = 'disabled="disabled"';
                    }

                    if (arguments[2] && (arguments[2].channel.key === 'ali_pay' ||
                        arguments[2].channel.key === 'ali_transfer' ||
                        arguments[2].channel.key === 'ali_app')) {
                        __str = 'readonly="readonly"'
                    }
                    if (data) {
                        _str += '<input type="text" ' + __str + ' class="form-control"  ' +
                            'name="merchant_no" required placeholder="请输入商户号" value="' + data + '">';
                    } else {
                        _str += '<input type="text" ' + __str + 'class="form-control" ' +
                            'name="merchant_no" required placeholder="请输入商户号">';
                    }

                    return  _str
                }
            },
            {
                data: 'merchantName',
                width: '13%',
                title: '商户名称',
                render: function (data) {
                    var _str = '';
                    var __str = '';
                    if (arguments[2] && arguments[2]['type']['self']['isUse'] === true) {
                        __str = 'disabled="disabled"';
                    }
                    if (data) {
                        _str += '<input type="text" ' + __str + ' class="form-control" ' +
                            'name="merchant_name" required placeholder="请输入商户名称" value="' + data + '">';
                    } else {
                        _str += '<input type="text" ' + __str + ' class="form-control" ' +
                            'name="merchant_name" required placeholder="请输入商户名称">';
                    }

                    return  _str
                }
            },
            {
                data: 'serverConfig',
                width: '15%',
                title: '服务商',
                render: function (data) {
                    var _str = '';
                    var __str = '';
                    var i;
                    var serverData = [];
                    if (arguments[2]) {
                        if (arguments[2].channel.key === 'ali_pay'
                            || arguments[2].channel.key === 'ali_transfer'
                            || arguments[2].channel.key === 'ali_app'
                        ) {
                            serverData = aliData;
                        } else {
                            serverData = wxData;
                        }
                    }

                    for (i = 0;i < serverData.length; i++) {
                        if (serverData[i].type == 2) {
                            if (data && data.id == serverData[i].id) {
                                __str += '<option selected value="' + serverData[i].id + '">' + serverData[i].name +
                                    '</option>'
                            } else {
                                __str += '<option value="' + serverData[i].id + '">' + serverData[i].name + '</option>'
                            }
                        }

                    }
                    if (data && data.disable) {
                        _str += '<select class="form-control" disabled="disabled" ' +
                            'name="server_config" style="width: 180px">'
                    } else {
                        _str += '<select class="form-control" ' +
                            'name="server_config" style="width: 180px">'
                    }

                    _str += '<option value="">请选择服务商类别</option>' +
                        __str +
                        '</select>';
                    return  _str
                }
            },
            {
                data: 'serverSelfConfig',
                width: '15%',
                title: '非服务商',
                render: function (data) {
                    var _str = '';
                    var __str = '';
                    var i;
                    var serverData = [];
                    if (arguments[2]) {
                        if (arguments[2].channel.key === 'ali_pay'
                            || arguments[2].channel.key === 'ali_transfer'
                            || arguments[2].channel.key === 'ali_app') {
                            serverData = aliData;
                        } else {
                            serverData = wxData;
                        }
                    }
                    for (i = 0;i < serverData.length; i++) {
                        if (serverData[i].type == 1) {
                            if (data && data.id == serverData[i].id) {
                                __str += '<option selected value="' + serverData[i].id + '">' + serverData[i].name +
                                    '</option>'
                            } else {
                                __str += '<option value="' + serverData[i].id + '">' + serverData[i].name + '</option>'
                            }
                        }
                    }
                    if (data && data.disable) {
                        _str += '<select class="form-control" disabled="disabled" ' +
                            'name="server_self_config" style="width: 180px">'
                    } else {
                        _str += '<select class="form-control" ' +
                            'name="server_self_config" style="width: 180px">'
                    }
                    _str += '<option value="">请选择非服务商类别</option>' +
                        __str +
                        '</select>';
                    return  _str
                }
            },
            {
                data: 'test',
                width: '10%',
                title: '操作',
                render: function (data) {
                    var _str = '';
                    if (arguments[2] && arguments[2].channel.key === 'ali_pay') {
                        if (arguments[2] && arguments[2]['type']['server']['isUse'] === true) {
                            if (accountData && !accountData.payAuth) {
                                _str += '<span name="test_auth">请授权</span>'
                            } else {
                                _str += '<span name="test_auth">已授权</span>'
                            }
                        } else {
                            _str += '<span name="test_auth"></span>'
                        }
                    } else {
                        if (data) {
                            _str += '<button name="test_button" disabled="disabled" class="btn btn-success">测试</button>';
                        } else {
                            _str += '<button name="test_button" class="btn btn-success">测试</button>';
                        }
                    }
                    return  _str
                }
            },
            {
                data: 'state',
                width: '10%',
                title: '是否禁用',
                render: function (data) {
                    var _str = '';
                    // _str += "<a href= 'javascript:void(0)' func='forbiddenType'>禁用</a>";
                    // _str += '<input name="forbidden_text" style="display: none" type="text" value="-1"/>';
                    if (!updateId) {
                        _str += '<button name="forbidden_button" class="btn btn-success" value="1">已启用</button>';
                    } else {
                        if (data && data == 1) {
                            _str += '<button name="forbidden_button" class="btn btn-success" value="1">已启用</button>';
                        } else {
                            _str += '<button name="forbidden_button" class="btn btn-danger" value="-1">已禁用</button>';
                        }
                    }
                    return  _str
                }
            }
        ],
        sDom: '<"row-fluid"<"col - md - 12myBox">r>t<"row - fluid">',
        initComplete: function() {
            $(table).delegate('[name=account_type],[name=merchant_no],' +
                '[name=server_config],[name=server_self_config]', 'change', function () {
                var row = $(this).parents("tr");
                changeData(row);
            });

            $(table).delegate('[name=forbidden_button]', 'click', function () {
                var row = $(this).parents("tr");
                forbiddenType(row);
            });

            $(table).delegate('[name=test_button]', 'click', function () {
                var row = $(this).parents("tr");
                // var type = $(row).find('[name=account_type]').val();
                var configId;
                var accountType = $(row).find('select[name=account_type]').val();
                if (accountType === 'self') {
                    configId = $(row).find('select[name=server_self_config]').val()
                }
                if (accountType === 'server') {
                    configId = $(row).find('select[name=server_config]').val()
                }
                var merchantNo = $(row).find('[name=merchant_no]').val();
                var type = $(row).find('[name=account_channel]').val();
                if (!accountType) {
                    return toFocus($(row).find('select[name=account_type]'), '请选择类型')
                }

                if (accountType === 'self' && !configId) {
                    return toFocus($(row).find('select[name=server_self_config]'), '请选择')
                }
                if (accountType === 'server' && !configId) {
                    return toFocus($(row).find('select[name=account_type]'), '请选择')
                }

                testPay(configId, merchantNo, type, accountType, row);
            })
        }
    };
    this.datatable = setDataTable($(table), dataTableOptions, null, {zeroRecords: "添加账户"});
};

function forbiddenType(row) {
    var buttonValue = $(row).find('[name=forbidden_button]').val();
    if (buttonValue === '-1') {
        $(row).find('[name=forbidden_button]').val('1');
        $(row).find('[name=forbidden_button]').attr('class', 'btn btn-success');
        $(row).find('[name=forbidden_button]').text('已启用');
    }
    if (buttonValue === '1') {
        $(row).find('[name=forbidden_button]').val('-1');
        $(row).find('[name=forbidden_button]').attr('class', 'btn btn-danger');
        $(row).find('[name=forbidden_button]').text('已禁用');
    }
}

function testPay(configId, merchantNo, type, accountType, row) {
    ajax_rewrite('post', '/api/bind/pay/test', JSON.stringify({
        configId: configId,
        sellerId: merchantNo,
        type: type,
        accountType: accountType
    }),null, function (status, json) {
        if (status === 'success' && json.tag === 'success') {
            $(row).find('[name=test_button]').prop('disabled', 'disabled');
            return setAlertModal('测试成功')
        } else {
            return setAlertModal(json.message)
        }
    })
}

/**
 * data修改
 * @param row
 */
function changeData(row) {
    //  数据发生变更则进行修改
    $(row).find('[name=test_button]').prop('disabled', false);
    var type = $(row).find('[name=account_type]').val();
    var channel = $(row).find('[name=account_channel]').val();
    if (type === 'self') {
        $(row).find('[name=server_self_config]').prop('disabled', false);
        $(row).find('[name=server_config]').prop('disabled', 'disabled');

        $(row).find('[name=merchant_no]').prop('disabled', 'disabled');
        $(row).find('[name=merchant_name]').prop('disabled', 'disabled');
        if (channel === 'ali_pay') {
            $(row).find('[name=test_auth]').text('')
        }
    } else if (type === 'server') {
        $(row).find('[name=server_self_config]').prop('disabled', 'disabled');
        $(row).find('[name=server_config]').prop('disabled', false);

        $(row).find('[name=merchant_no]').prop('disabled', false);
        $(row).find('[name=merchant_name]').prop('disabled', false);
        $(row).find('[name=test_auth]').text('请保存后授权')
    } else {

        $(row).find('[name=server_self_config]').prop('disabled', false);
        $(row).find('[name=server_config]').prop('disabled', false);
        $(row).find('[name=test_auth]').text('')
    }


}
//  提交按钮
function submitBind(datable, updateId) {
    var accountName = $('#account_name').val();
    var businessSystem = $('#system_name').val();
    var businessType = $('#system_type').val();
    var businessId = $('#system_id').val();

    if (!accountName) {
        return toFocus($('#account_name'), '请填写账户名称')
    }
    if (!businessSystem) {
        return toFocus($('#system_name'), '请选择系统')
    }

    var rows = datable.rows()[0];
    var i;
    var datas = [];
    for (i = 0; i < rows.length; i++) {
        var triem = $("#main-table tbody tr").eq(i);//获取当前行
        var accountType = $(triem).find('select[name=account_type]').val();
        var accountChannel = $(triem).find('[name=account_channel]').val();
        var merchantNo = $(triem).find('[name=merchant_no]').val();
        var merchantName = $(triem).find('[name=merchant_name]').val();
        var serverConfig = $(triem).find('select[name=server_config]').val();
        var serverSelfConfig = $(triem).find('select[name=server_self_config]').val();
        var isAbled = $(triem).find('[name=test_button]').is(':disabled');
        var forbiddenValue = $(triem).find('[name=forbidden_button]').val();
        if (forbiddenValue === '-1') {
            continue;
        }
        if (!accountType) {
            return toFocus($(triem).find('select[name=account_type]'), '请选择类型')
        }
        if (!accountChannel) {
            return toFocus($(triem).find('[name=account_channel]'), '请选择支付渠道')
        }

        if (!merchantNo && accountType === 'server'
            && ['ali_pay', 'ali_transfer', 'ali_app'].indexOf(accountChannel) < 0) {
            return toFocus($(triem).find('[name=merchant_no]'), '请填入商户号')
        }
        if (!merchantName && accountType === 'server') {
            return toFocus($(triem).find('[name=merchant_name]'), '请填入商户名称')
        }
        if (accountType === 'self' && !serverSelfConfig) {
            return toFocus($(triem).find('select[name=server_self_config]'), '请选择自营类型')
        }
        if (accountType === 'server' && !serverConfig) {
            return toFocus($(triem).find('select[name=server_config]'), '请选择服务商类型')
        }
        if (!isAbled && accountChannel !== 'ali_pay') {
            return toFocus($(triem).find('[name=test_button]'), '请先进行测试');
        }

        datas.push({
            accountType: accountType,
            accountChannel: accountChannel,
            merchantNo: merchantNo || null,
            merchantName: merchantName || null,
            serverConfig: serverConfig || null,
            serverSelfConfig: serverSelfConfig || null
        })
    }
    if (!updateId) {
        ajax_rewrite('post', '/api/bind', JSON.stringify({
            name: accountName,
            outSystem: businessSystem || null,
            outType: businessType || null,
            outId: businessId || null,
            data: datas
        }),null, function (status, json) {
            if (status === 'success' && json.tag === 'success') {
                var data = json.data;
                $('#account_token').text(data.token);
                $('#account_uuid').text(data.uuid);
                return setAlertModal('保存成功',2,null, function () {
                    location.href = '/bind?id=' + data.id
                })
            } else {
                return setAlertModal(json.message)
            }
        })
    } else {
        ajax_rewrite('post', '/api/bind/update', JSON.stringify({
            name: accountName,
            outSystem: businessSystem || null,
            outType: businessType || null,
            outId: businessId || null,
            data: datas,
            id: updateId
        }),null, function (status, json) {
            if (status === 'success' && json.tag === 'success') {
                setAlertModal('修改成功', 2, null, function () {
                    location.href = '/bind?id=' + updateId
                })
            } else {
                return setAlertModal(json.message)
            }
        })
    }
}

function ajax_rewrite(method, url, data, loadingEleId, callback) {
    var reJson = '';
    $.ajax({
        type: method,
        timeout: 30000,
        url: url,
        headers: {
            'Content-Type': 'application/json'
        },
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

function toFocus(ele, msg) {
    ele.tips({
        side: 3,
        msg: msg,
        bg: "#AE81FF",
        time: 2
    });
    ele.focus();
}

$(function () {
    var updateId = $('#update_id').text();
    var bind = new Bind(updateId);
    bind.start();

    if (updateId) {
        $('#submit_account').css('display', 'none');
    }
    // if (!updateId) {
    //     $('#update_account').css('display', 'none');
    // }
    $('#update_account').css('display', 'none');

    $('#submit_account').click(function () {
        submitBind(bind.datatable, updateId);
    });

    $('#update_account').click(function () {
        submitBind(bind.datatable, updateId)
    })
});