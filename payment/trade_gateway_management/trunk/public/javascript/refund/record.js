var Record = function (searchEle, tableEle) {
    var searchEle = $(searchEle);
    this.table = $(tableEle);
    this.searchEle = {
        startTime: searchEle.find('.queryTime[func=startTime]'),
        endTime: searchEle.find('.queryTime[func=endTime]'),
        system: searchEle.find('[func=system]'),
        status: searchEle.find('[func=status]'),
        source: searchEle.find('[func=source]'),
        mainTradeChannel: searchEle.find('[func=mainTradeChannel]'),
        orderType: searchEle.find('[func=orderType]'),
        validateStatus: searchEle.find('[func=validateStatus]'),
        validateStatus2: searchEle.find('[func=validateStatus2]'),
        tradeRecordNo: searchEle.find('#tradeRecordNo'),
        orderNo: searchEle.find('#orderNo'),
        cityId: searchEle.find('[func=cities]')
    };
    this.query = {

    };
};

Record.prototype.init = function () {
    this.searchEle.endTime.val(moment().format("YYYY-MM-DD"));
    this.searchEle.startTime.val(moment().add(-3, "d").format("YYYY-MM-DD"));
    $('.queryTime').datetimepicker({
        format: 'yyyy-MM-dd',
        showMeridian: true,
        autoclose: true,
        forceParse: true,
        todayBtn: true,
        minView: 'month',
        todayHighlight: true,
        startDate: '2017-01-01',
        endDate: new Date()
    });
    this.searchEle.system.append(objToOptions(mapping.SYSTEM));
    this.searchEle.status.append(objToOptions(mapping.STATUS));
    this.searchEle.source.append(objToOptions(mapping.SOURCE));
    this.searchEle.mainTradeChannel.append(objToOptions(mapping.MAIN_TRADE_CHANNEL));
    this.searchEle.orderType.append(objToOptions(mapping.PAYMENT_ORDER_TYPE));
    this.searchEle.validateStatus.append(objToOptions(mapping.VALIDATE_STATUS));
    this.searchEle.validateStatus2.append(objToOptions(mapping.VALIDATE_STATUS2));
    var that = this,
        options;
    that.loadQuery();
    that.statisticsInit(); //统计
    that.getCities();
    options = {
        stateSave: false, //不存储页数状态
        searching: true,
        processing: true,
        autoWidth: false,
        ordering: false,
        order: [
            [0, 'desc']
        ],
        serverSide: true, //服务器分页
        lengthMenu: [
            [30, 50, 100],
            [30, 50, 100]
        ],
        ajax: {
            url: '/api/refund/record',
            type: 'get',
            data: function (par) {
                var params = {};
                query = that.query;
                if (query.startTime) {
                    params.startTime = query.startTime;
                }
                if (query.endTime) {
                    params.endTime = query.endTime;
                }
                if (query.system) {
                    params.system = query.system;
                }
                if (query.orderType) {
                    params.orderType = query.orderType;
                }
                if (query.source) {
                    params.source = query.source;
                }
                if (query.mainTradeChannel) {
                    params.mainTradeChannel = query.mainTradeChannel;
                }
                if (query.status) {
                    params.status = query.status;
                }
                if (query.validateStatus) {
                    params.validateStatus = query.validateStatus;
                }
                if (query.validateStatus2) {
                    params.validateStatus2 = query.validateStatus2;
                }
                if (query.tradeRecordNo) {
                    params.tradeRecordNo = query.tradeRecordNo;
                }
                if (query.orderNo) {
                    params.orderNo = query.orderNo;
                }
                if (query.cityId) {
                    params.cityId = query.cityId
                }
                params.limit = par.length;
                params.offset = par.start;
                return params;
            },
            dataSrc: function (json) {
                return json.data;
            }
        },
        columns: [{
                data: 'tradeRecordNo',
                width: '8%',
                title: '退款号'
            },
            {
                data: 'paymentRecordNo',
                width: '8%',
                title: '付款号'
            },
            {
                data: 'createdAt',
                width: '8%',
                title: '发起时间'
            },
            {
                data: 'statusStr',
                width: '5%',
                title: '退款状态',
                createdCell: function (cell, cellData, data) {
                    switch (data.status) {
                        case 'SUCCESS':
                            $(cell).addClass('trade-success');
                            break;
                        case 'FAIL':
                            $(cell).addClass('trade-fail');
                            break;
                        case 'PENDDING':
                            $(cell).addClass('trade-pendding');
                            break;
                    }

                }
            },
            {
                data: 'mainTradeChannelStr',
                width: '5%',
                title: '交易渠道'
            },
            {
                data: 'tradeChannelStr',
                width: '8%',
                title: '交易渠道明细'
            },
            {
                data: 'sourceStr',
                width: '5%',
                title: '交易账户'
            },
            {
                data: 'totalFee',
                width: '5%',
                title: '退款金额',
                render: function (data) {
                    return '¥' + data.toFixed(2);
                }
            },
            {
                data: 'orderTypeStr',
                width: '8%',
                title: '对应单据类型'
            },
            {
                data: 'orderId',
                width: '5%',
                title: '对应单据单号'
            },
            {
                data: 'systemStr',
                width: '7%',
                title: '发起系统'
            },
            {
                data: 'remark',
                width: '5%',
                title: '退款备注'
            },
            {
                data: 'message',
                width: '5%',
                title: '退款错误说明'
            },
            {
                data: 'validateStatusName',
                width: '5%',
                title: '对账状态',
                createdCell: function (cell, cellData, data) {
                    switch (data.validateStatus) {
                        case 99:
                            $(cell).addClass('trade-success');
                            break;
                        case -99:
                            $(cell).addClass('trade-fail');
                            break;
                        case -98:
                            $(cell).addClass('trade-fail');
                            break;
                        case -97:
                            $(cell).addClass('trade-fail');
                            break;
                        case -1:
                            $(cell).addClass('trade-fail');
                            break;
                        case 0:
                            $(cell).addClass('trade-pendding');
                            break;
                    }
                }
            },
            {
                data: 'validateBalance',
                width: '5%',
                title: '对账差额',
                render:function (data) {
                    return data || '-'
                }
            },
            {
                data: 'error',
                width: '5%',
                title: '核验失败原因'
            },
            {
                data: 'cityName',
                width: '5%',
                title: '城市'
            },
            {
                data: 'cityId',
                width: '5%',
                title: '城市编号'
            }
        ],
        sDom: '<"row-fluid"<"col - md - 6myBox"><"col-md - 12" l>r>t<"row - fluid"<"col - md - 6" i><"col - md - 6" p>>'
    };
    that.dateTable = setDataTable(that.table, options);
    $('[func=search]').on('click', function () {
        that.loadQuery().draw();
    });
    $('[func=export]').on('click', function () {
        var url = '/api/refund/record/export?';
        var query = that.query;
        var querys = [];
        for (var key in query) {
            if (!query.hasOwnProperty(key)) {
                continue;
            }
            querys.push(key + '=' + encodeURIComponent(query[key]));
        }
        url += querys.join('&');
        window.location = url;
    });
    return that;
};

Record.prototype.loadQuery = function () {
    var search = this.searchEle;
    this.set({
        startTime: search.startTime.val(),
        endTime: search.endTime.val(),
        status: search.status.val(),
        system: search.system.val(),
        source: search.source.val(),
        mainTradeChannel: search.mainTradeChannel.val(),
        orderType: search.orderType.val(),
        validateStatus: search.validateStatus.val(),
        validateStatus2: search.validateStatus2.val(),
        tradeRecordNo: search.tradeRecordNo.val(),
        orderNo: search.orderNo.val(),
        cityId: search.cityId.val()
    });
    return this;
};

Record.prototype.set = function (query) {
    this.query = {};
    for (var key in query) {
        if (query.hasOwnProperty(key) && query[key] && query[key] != 'all') {
            this.query[key] = query[key];
        }
    }
    return this;
};
Record.prototype.draw = function () {
    this.dateTable.draw();
    this.statisticsInit(); //统计
    return this;
};

Record.prototype.statisticsInit = function () {
    var that = this;
    var query = that.query;
    $.ajax({
        url: '/api/refund/record/statistic',
        method: 'GET',
        data: query,
        success: function (data) {
            if (data.tag == 'success') {
                $('#statisticArea').html('<th>暂无记录...</th>');
                var list = data.data;
                var html = '<tr><th>序号</th><th>交易渠道</th><th>交易渠道帐户</th><th>交易金额</th><th>未对账金额</th><th>已对账金额</th>';
                html += '<th>差异数量</th><<th>差异金额</th></tr>';
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    html += '<tr>';
                    html += '<td>' + (i + 1) + '</td>';
                    html += '<td>' + item.tradeChannel + '</td>';
                    html += '<td>' + item.source + '</td>';
                    html += '<td>' + item.totalFee + '</td>';
                    html += '<td>' + (item.invalidateFee == 0 ? 0 : item.invalidateFee) + '</td>';
                    html += '<td>' + (item.validateFee == 0 ? 0 : item.validateFee) + '</td>';
                    html += '<td>' + (item.diffNum == 0 ? 0 : item.diffNum) + '</td>';
                    html += '<td>' + (item.diffSum == 0 ? 0 : item.diffSum) + '</td>';
                    html += '</tr>'
                }
                $('#statisticArea').html(html)
            }
        }
    })
};


Record.prototype.getCities = function () {
    var that = this;

    getCities(function (error, map) {
        if (error) {
            return;
        }
        that.searchEle.cityId.append(objToOptions(map));
    })
};


var record = new Record('.search', '#main-table');

record.init();