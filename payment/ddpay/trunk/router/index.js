'use strict';

const router = require('koa-router')();
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({
    //允许使用html标签
    html: true
});
const path = require('path');

const mdToHtml = (title, filePath) => {
    var header = '<head>' +
        '<meta charset="utf-8">' +
        '<link href="/css/markdown.css" rel="stylesheet" />' +
        '<link href="/css/ddMarkdown.css" rel="stylesheet" />' +
        '<title>' + title + '</title></head>\n';
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, filePath), 'utf8', function (error, data) {
            if (error) {
                return reject(error);
            } else {
                resolve(header + md.render(data));
            }
        });
    })
};

/**
 * 返回API文档
 */
router.get('/api', (ctx) => {
    return mdToHtml('API', '../doc/API.md')
        .then((html) => {
            ctx.response.body = html;
            return ctx;
        })
})

router.use('/api', require('./api').routes())

module.exports = router;
