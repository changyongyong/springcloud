/**
 * Created by frank-z on 2017/4/7.
 */
var Record = function (searchEle, tableEle) {
    var searchEle = $(searchEle);
    this.table = $(tableEle);
    this.searchEle = {
        startTime: searchEle.find('.queryTime[func=startTime]'),
        endTime: searchEle.find('.queryTime[func=endTime]'),
        //system: searchEle.find('[func=system]'),
        status: searchEle.find('[func=status]'),
        type: searchEle.find('[func=type]'),
        source: searchEle.find('[func=source]'),
        mainTradeChannel: searchEle.find('[func=mainTradeChannel]'),
        //orderType: searchEle.find('[func=orderType]'),
        validateStatus: searchEle.find('[func=validateStatus]'),
        tradeRecordNo: searchEle.find('#tradeRecordNo'),
    };
    this.query = {};
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
    //this.searchEle.system.append(objToOptions(mapping.SYSTEM));
    this.searchEle.status.append(objToOptions(mapping.STATUS));
    this.searchEle.type.append(objToOptions(mapping.BUSINESS_TYPE));
    this.searchEle.source.append(objToOptions(mapping.SOURCE));
    this.searchEle.mainTradeChannel.append(objToOptions(mapping.MAIN_TRADE_CHANNEL));
    //this.searchEle.orderType.append(objToOptions(mapping.PAYMENT_ORDER_TYPE));
    this.searchEle.validateStatus.append(objToOptions(mapping.VALIDATE_STATUS));
    var that = this,
        options;
    that.loadQuery();
    options = {
        stateSave: false, //不存储页数状态
        searching: true,
        processing: true,
        autoWidth: false,
        ordering: true,
        order: [
            [0, 'desc']
        ],
        serverSide: true, //服务器分页
        lengthMenu: [
            [30, 50, 100],
            [30, 50, 100]
        ],
        ajax: {
            url: '/api/missing/record',
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
                // if (query.system) {
                //     params.system = query.system;
                // }
                // if (query.orderType) {
                //     params.orderType = query.orderType;
                // }
                if (query.source) {
                    params.source = query.source;
                }
                if (query.mainTradeChannel) {
                    params.mainTradeChannel = query.mainTradeChannel;
                }
                if (query.status) {
                    params.status = query.status;
                }
                if (query.type) {
                    params.type = query.type;
                }
                if (query.tradeRecordNo) {
                    params.tradeRecordNo = query.tradeRecordNo;
                }
                params.limit = par.length;
                params.offset = par.start;
                return params;
            },
            dataSrc: function (json) {
                return json.data;
            }
        },
        columns: [
            {
                data: 'tradeRecordNo',
                width: '12%',
                title: '交易号'
            },
            {
                data: 'createdAt',
                width: '15%',
                title: '创建时间',
                order: false
            },
            {
                data: 'typeName',
                width: '15%',
                title: '业务类型',
                order: false
            },
            {
                data: 'status',
                width: '15%',
                title: '支付状态',
                order: false
            },
            {
                data: 'source',
                width: '15%',
                title: '来源',
                order: false
            },
            {
                data: 'tradeChannel',
                width: '15%',
                title: '交易渠道',
                order: false
            },{
                data: 'fee',
                width: '15%',
                title: '金额',
                order: false
            },{
                data: 'message',
                width: '15%',
                title: '备注',
                order: false
            },
        ],
        sDom: '<"row-fluid"<"col - md - 6myBox"><"col-md - 12" l>r>t<"row - fluid"<"col - md - 6" i><"col - md - 6" p>>'
    };
    that.dateTable = setDataTable(that.table, options);
    $('[func=search]').on('click', function () {
        that.loadQuery().draw();
    });
    $('[func=export]').on('click', function () {
        var url = '/api/missing/record/export?';
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
}

Record.prototype.loadQuery = function () {
    var search = this.searchEle;
    this.set({
        startTime: search.startTime.val(),
        endTime: search.endTime.val(),
        status: search.status.val(),
        type: search.type.val(),
        // system: search.system.val(),
        source: search.source.val(),
        mainTradeChannel: search.mainTradeChannel.val(),
        tradeRecordNo: search.tradeRecordNo.val(),
        //orderType: search.orderType.val()
    });
    return this;
}

Record.prototype.set = function (query) {
    this.query = {};
    for (var key in query) {
        if (query.hasOwnProperty(key) && query[key] && query[key] != 'all') {
            this.query[key] = query[key];
        }
    }
    return this;
}
Record.prototype.draw = function () {
    this.dateTable.draw();
    return this;
}
var record = new Record('.search', '#main-table');

record.init();