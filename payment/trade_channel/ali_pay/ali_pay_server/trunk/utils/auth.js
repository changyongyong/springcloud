/**
 * Created by wt on 2017/7/11.
 */

module.exports = {
    decrypt: (text)=> {
        text = new Buffer(text, 'base64');
        return text.toString();
    },
    encrypt: (text)=> {

        text = new Buffer(text);
        text = text.toString('base64');

        return text
    }
};