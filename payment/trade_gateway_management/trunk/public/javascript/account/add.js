/**
 * Created by SEELE on 2017/7/26.
 */

$(function () {
    initData();
    $('#submit_account').click(function () {
        submitAccount()
    });
});

//  提交账户请求
function submitAccount() {
    var accountChannel = $('#account_channel').val();
    var accountType = $('#account_type').val();
    var accountName = $('#account_name').val();
    var accountSecretKey = $('#account_secret_key').val();
    var accountEmail = $('#account_app_email').val();
    var accountAppId = $('#account_app_id').val();


    if (!accountName) {
        return toFocus($('#account_name'), '请填写名称')
    }
    if (!accountChannel) {
        return toFocus($('#account_channel'), '请选择支付渠道')
    }
    if (!accountEmail) {
        return toFocus($('#account_app_email'), '请输入邮箱')
    }
    if (!accountAppId) {
        return toFocus($('#account_app_id'), '请输入APPId')
    }
    if (!accountSecretKey) {
        return toFocus($('#account_secret_key'), '请输入秘钥')
    }
    ajax_load('POST', '/api/account/add', {
        accountChannel: accountChannel,
        accountType: accountType,
        accountName: accountName,
        accountSecretKey: accountSecretKey,
        accountEmail: accountEmail,
        accountAppId: accountAppId
    },null, function (status, json) {
        if (status === 'success' && json.tag === 'success') {
            return setAlertModal('创建成功')
        } else {
            return setAlertModal(json.message)
        }
    })
}

//  初始化数据

function initData() {
    var channel = {
        'ALI': '支付宝'
    };
    var type = {
        'server': '服务商',
        'self': '非服务商'
    };

    $('#account_channel').append(objToOptions1(channel));
    $('#account_type').append(objToOptions(type));
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