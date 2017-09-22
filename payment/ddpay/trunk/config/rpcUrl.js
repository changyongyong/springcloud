'use strict';

const ENV = process.env.NODE_ENV || 'development';
let urls;
switch (ENV) {
    case 'development':
        urls = {
            sequence: 'http://192.168.1.240:52150'
        };
        break;
    case 'test':
        urls = {
            sequence: 'http://192.168.1.240:52150'
        };
        break;
    case 'experience':
        urls = {
            sequence: 'http://192.168.0.101:52150'
        };
        break;
    case 'stage':
        urls = {
            sequence: 'http://192.168.0.101:52150'
        };
        break;
    case 'production':
        urls = {
            sequence: 'http://sequencerpc.diandainfo.com'
        };
        break;
}

module.exports = urls;
