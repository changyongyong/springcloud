/**
 * Created by SEELE on 2017/7/11.
 */

module.exports = {
    encrypt: (text)=> {
        // let cipher = crypto.createCipher('aes-256-cbc', password);
        // let encryptedPassword = cipher.update(text, 'utf8', 'base64');
        // encryptedPassword += cipher.final('base64');
        // return decryptedPassword;

        text = new Buffer(text);
        text = text.toString('base64');

        return text
    }
};