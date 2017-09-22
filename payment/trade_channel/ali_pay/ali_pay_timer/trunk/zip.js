/**
 * Created by frank-z on 2017/4/5.
 */
const fs = require('fs');
const path = require('path');
const unzip = require('unzip');
const request = require('request');
const Promise = require('bluebird');
const requestP = Promise.promisify(request);
const logger = global.Logger('zip');

const ZIP_Path = '../ZIP/';  //配置成绝对路径
const CSV_Path = '../CSV/';  //配置成绝对路径

const url = 'http://192.168.1.197:3200/alipay/bill?billDate=2017-03-31&billType=trade';

// requestUrl{string}->csvVisitPath{string}
const readzipByUrl = (url) => {
    let zipUrl;
    let csvUrl;
    return requestP(url)
    //获取实际下载路径
        .then((response) => {
            if (response.statusCode != 200) {
                return Promise.reject('请求出错')
            } else {
                let data = response.body;
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    return Promise.reject('文件下载地址获取失败 :' + e)
                }
                return data.data.billDownloadUrl;
            }
        })
        //下载zip
        .then(realUrl => {
            zipUrl = ZIP_Path + Date.now().valueOf() + '.zip';
            return new Promise(function (resolve, reject) {
                let req = request(realUrl).pipe(fs.createWriteStream(zipUrl));
                req.on('close', function () {
                    resolve();
                });
                req.on('error', function (error) {
                    reject(error);
                })
            })
        })
        //zip解压
        .then(() => {
            csvUrl = path.join(CSV_Path + Date.now().valueOf());

            return new Promise(function (resolve, reject) {
                let extract = unzip.Extract({path: csvUrl});
                extract.on('error', function (err) {
                    logger.info('error++++++++++++++++++++++');
                    logger.info(err);
                    reject(err);
                });
                extract.on('close', function () {
                    logger.info('解压完成!!');
                    resolve();
                });
                fs.createReadStream(zipUrl).pipe(extract);
            })
        })
        //文件名修改 及无用文件删除
        .then(() => {
        /* eslint-disable */
            let files = fs.readdirSync(path.normalize(csvUrl));
            let target;
            let rmTarget;
            files.forEach(file => {
                let isTarget = /\)\.csv$/.test(file);
                if (!isTarget) {
                    target = file;
                } else {
                    rmTarget = file;
                }
            });
            try {
                if (target) {
                    fs.renameSync(path.normalize(csvUrl + '/' + target), path.normalize(csvUrl + '/index.csv'));
                }
                if (rmTarget) {
                    fs.unlinkSync(path.normalize(csvUrl + '/' + rmTarget));
                }
            } catch (e) {
                return Promise.reject('文件改名失败');
            }
            return path.normalize(csvUrl + '/index.csv');
        })
        //删除zip
        .then(visitPath => {
            try {
                fs.unlinkSync(path.normalize(zipUrl));
            } catch (e) {
                logger.info('zip删除失败');
            }
            return visitPath;
        })
};

//test
readzipByUrl(url)
    .then(visitPath => {
        logger.info('visitPath');
        logger.info(visitPath)
    });



