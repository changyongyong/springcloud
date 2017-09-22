const router = require('express').Router();
const {
    ddpay,
    tradeGateway
} = require('../service');

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

const initRouter = (path, routerConfigs) => {
    for (let routerConfig of routerConfigs) {
        router[routerConfig.method.toLowerCase()](`/${path}${routerConfig.outPath}`, routerConfig.func);
    }
}

/**
 * 返回API文档
 */
router.get('/api', (req, res) => {
    mdToHtml('API', '../doc/API.md')
        .then((html) => {
            res.end(html);
        })
})

router.get('/alive', (req, res) => {
    res.success('alive');
})

initRouter('tradeGateway', tradeGateway.routers);
initRouter('ddpay', ddpay.routers);

module.exports = router;