'use strict';

const ENV = process.env.NODE_ENV || 'development';
let urls;
switch (ENV) {
    case 'development':
        urls = {
            globalInfo: 'http://192.168.1.243:39050',
            sequence: 'http://192.168.1.240:52150'
        };
        break;
    case 'test':
        urls = {
            globalInfo: 'http://192.168.1.243:39050',
            sequence: 'http://192.168.1.240:52150'
        };
        break;
    case 'experience':
        urls = {
            globalInfo: 'http://192.168.0.103:39050',
            sequence: 'http://192.168.0.101:52150'
        };
        break;
    case 'production':
        urls = {
            globalInfo: 'http://qjrpc.diandainfo.com',
            sequence: 'http://0.0.0.0:52150'
        };
        break;
}

module.exports = urls;
