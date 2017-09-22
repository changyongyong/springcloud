/**
 * Created by SEELE on 2017/7/7.
 */

/**
 * Created by wt on 2017/7/7.
 */
var Record = function (searchEle, tableEle) {
    var searchEle = $(searchEle);
    this.table = $(tableEle);
    this.searchEle = {
        accountName: searchEle.find('#account_name'),
        accountSystem: searchEle.find('#account_system')
    };
    this.query = {};
};

Record.prototype.init = function () {
    var that = this,
        options;
    that.loadQuery();
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
            url: '/api/bind/list',
            type: 'get',
            data: function (par) {
                var params = {};
                var query = that.query;
                if (query.accountName) {
                    params.accountName = query.accountName;
                }
                if (query.accountSystem) {
                    params.accountSystem = query.accountSystem;
                }
                params.limit = par.length;
                params.offset = par.start;
                console.log(params);
                return params;
            },
            dataSrc: function (json) {
                return json.data;
            }
        },
        columns: [
            {
                data: 'id',
                width: '12%',
                title: '账户编号'
            },
            {
                data: 'name',
                width: '15%',
                title: '账户名称'
            },
            {
                data: 'outId',
                width: '15%',
                title: '业务Id'
            },
            {
                data: 'outType',
                width: '15%',
                title: '业务类型'
            },{
                data: 'outSystem',
                width: '15%',
                title: '业务名称'
            },
            {
                data: 'accountId',
                width: '15%',
                title: '用户标识Id'
            },
            {
                data: null,
                width: '15%',
                title: '操作',
                render: function () {
                    var row = arguments[2];
                    return '<a target= "_blank" href="/bind?id=' + row.id + '"><span>查看</span></a>'
                }
            },
        ],
        sDom: '<"row-fluid"<"col - md - 6myBox"><"col-md - 12" l>r>t<"row - fluid"<"col - md - 6" i><"col - md - 6" p>>'
    };
    that.dateTable = setDataTable(that.table, options);
    $('[func=search]').on('click', function () {
        that.loadQuery().draw();
    });
    return that;
}

Record.prototype.loadQuery = function () {
    var search = this.searchEle;
    this.set({
        accountName: search.accountName.val(),
        accountSystem: search.accountSystem.val()
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
};

var record = new Record('.search', '#main-table');

record.init();