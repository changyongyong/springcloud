/**
 * Created by SEELE on 2017/7/3.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const publicKeyPath = path.join(__dirname, '../config/rsa_public_key.pem');
const logger = require('./logger').Logger('alibs');

//将sPara拼接成字符串 ，按照“参数=参数值”的模式用“&”字符拼接成字符串
function getStringFromsPara(sPara) {
    //生成签名结果
    let prestr = '';
    let i;
    //把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
    for (i = 0; i < sPara.length; i++) {
        let obj = sPara[i];
        if (i === sPara.length - 1) {
            prestr = prestr + obj[0] + '=' + obj[1];
        } else {
            prestr = prestr + obj[0] + '=' + obj[1] + '&';
        }

    }
    return prestr;
}
//从json里面转变成数组并剔除 sign  sign_type，并排序
function getsParaFromJson(params) {
    let sPara = [];
    let key;
    if (!params) {
        return null;
    }
    for (key in params) {
        if ((!params[key]) || key === 'sign' || key === 'sign_type') {
            continue;
        }
        sPara.push([key, params[key]]);
    }
    sPara.sort();
    return sPara;
}
//除去数组中的空值和sign,并排序
function getsParaFromArr1(sParaTemp) {
    let sPara = [];
    let i;
    //除去数组中的空值和签名参数
    for (i = 0; i < sParaTemp.length; i++) {
        let value = sParaTemp[i];
        if (value[1] === null || value[1] === '' || value[0] === 'sign') {
            continue;
        }
        sPara.push(value);
    }
    sPara = sPara.sort();
    return sPara;
}
//从数组里面直接剔除 : 空值 \sign \sign_type 并排序
function getsParaFromArr(sParaTemp) {
    let sPara = [];
    let i;
    //除去数组中的空值和签名参数
    for (i = 0; i < sParaTemp.length; i++) {
        let value = sParaTemp[i];
        if (value[1] === null || value[1] === '' || value[0] === 'sign' ||
            value[0] === 'sign_type') {
            continue;
        }
        sPara.push(value);
    }
    sPara.sort();
    return sPara;
}
//encodeURI - sPara 转换URL中的中文字符等
function getPath(path, sPara) {
    let i;
    for (i = 0; i < sPara.length; i++) {
        let obj = sPara[i];
        let name = obj[0];
        let value = encodeURIComponent(obj[1]);
        if (i < (sPara.length - 1)) {
            path = path + name + '=' + value + '&';
        } else {
            path = path + name + '=' + value;
        }
    }
    return path.toString();
}
//TODO
function getRSASign(sPara, source, secretKey) {
    //生成签名结果
    let prestr = getStringFromsPara(sPara);
    let privatePem = secretKey;
    let key = privatePem.toString();
    let sign = crypto.createSign('RSA-SHA1');
    //var sign = crypto.createSign('sha256WithRSAEncryption');
    //var str = iconv.encode(prestr,'utf-8');
    sign.update(prestr, 'utf-8');
    return sign.sign(key, 'base64');
}
//从json里面转变成数组并剔除 sign  sign_type，并排序, sPara拼接成字符串 ，按照“参数=参数值”的模式用“&”字符拼接成字符串
function getSortString(params) {
    let sPara = []; //转换为数组利于排序 除去空值和签名参数
    sPara = getsParaFromJson(params);
    return getStringFromsPara(sPara);
}
//
function buildRequestPara(sParaTemp, source) {
    let sPara = [];
    sPara = getsParaFromArr(sParaTemp);
    let sig = getRSASign(sPara, source);
    sPara.push(['sign', sig]);
    return sPara;
}
//除去数组中的空值和sign,并排序，数组中加上签名sign
function buildRequestPara2(sParaTemp, source, secretKey) {
    let sPara = [];
    sPara = getsParaFromArr1(sParaTemp);
    let sig = getRSASign(sPara, source, secretKey);
    sPara.push(['sign', sig]);
    return sPara;
}
//数组sPara，encode后转换成键值串
function getEncodeURI(sPara) {
    let prestr = '';
    let i;
    for (i = 0; i < sPara.length; i++) {
        let obj = sPara[i];
        let name = obj[0];
        let value = encodeURIComponent(obj[1]);
        if (i < (sPara.length - 1)) {
            prestr = prestr + name + '=' + value + '&';
        } else {
            prestr = prestr + name + '=' + value;
        }
    }
    return prestr;
}
//同步验签  取response内容  然后RSA验签
function checkRSA(response, sign) {
    try {
        let prestr = JSON.stringify(response);
        let decode_prestr = prestr.replace(/\//g, '\\/');
        logger.info('待验签字符串', prestr);
        /* eslint-disable */
        let publicPem = fs.readFileSync(publicKeyPath);
        let pubkey = publicPem.toString();
        let sign_text = sign;
        //var check = crypto.createVerify('sha256WithRSAEncryption');
        let check = crypto.createVerify('RSA-SHA1');
        check.update(decode_prestr, 'UTF-8');
        let result = check.verify(pubkey, sign_text, 'base64');
        logger.info('验签结果', result);
        return result;
    } catch (err) {
        logger.error(err);
        logger.info('验签结果', false);
        return false;
    }
}
//异步验签 TODO
function verifySign(params) {
    try {
        let sPara = getsParaFromJson(params);
        let preStr = decodeURI(getStringFromsPara(sPara));
        /* eslint-disable */
        let publicPem = fs.readFileSync(publicKeyPath);
        let pubkey = publicPem.toString();
        let sign = params['sign'] ? params['sign'] : '';
        let check = crypto.createVerify('RSA-SHA1');
        check.update(preStr, 'UTF-8');
        let result = check.verify(pubkey, sign, 'base64');
        logger.info('验签结果', result);
        return result;
    } catch (err) {
        logger.error(err);
        logger.info('验签结果', false);
        return false;
    }
}


module.exports = {
    getPath: getPath,
    getSortString: getSortString,
    buildRequestPara: buildRequestPara,
    buildRequestPara2: buildRequestPara2,
    getEncodeURI: getEncodeURI,
    checkRSA: checkRSA,
    verifySign: verifySign
};