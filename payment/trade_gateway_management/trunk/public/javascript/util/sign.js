function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '' + match + '';
    });
}

function isJSON(str, pass_object) {
    if (pass_object && isObject(str)) return true;

    if (typeof str !== 'string') return false;

    str = str.replace(/\s/g, '').replace(/\n|\r/, '');

    if (/^\{(.*?)\}$/.test(str))
        return /"(.*?)":(.*?)/g.test(str);

    if (/^\[(.*?)\]$/.test(str)) {
        return str.replace(/^\[/, '')
            .replace(/\]$/, '')
            .replace(/},{/g, '}\n{')
            .split(/\n/)
            .map(function (s) { return isJSON(s); })
            .reduce(function (prev, curr) { return !!curr; });
    }

    return false;
}
(function () {
    $('[dd-action=sign]').on('click', function (params) {
        let data = $('[name=par]').val();
        let token = $('[name=token]').val();
        if (!isJSON(data)) {
            return alert('参数不是一个JSON');
        }
        if (!token) {
            return alert('密钥必填');
        }
        console.log(data);
        data = JSON.parse(data);
        $.ajax({
            url: '/api/util/sign',
            method: 'POST',
            contentType: 'application/json',
            json: true,
            data: JSON.stringify({
                data: data,
                token: token
            }),
            success: function (data) {
                if (data.tag !== 'success') {
                    return alert(data.error)
                }
                data = data.data;
                $('[name=signStr]').text(data.str);
                $('[name=result]').text(JSON.stringify(data.data));
                $('[name=sign]').text(data.sign);
            }
        })
    })
})()