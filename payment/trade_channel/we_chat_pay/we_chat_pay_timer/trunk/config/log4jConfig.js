'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';
const path = require('path');
let join = function (file) {
    return path.join(__dirname, '../log', file);
};
//暂时所有的环境都一样
module.exports = (function (env) {
    let config;
    switch (env) {
        case 'dev':
        case 'development':
            config = {
                appenders: [
                    {
                        type: 'console'
                    },
                    {
                        type: 'file',
                        filename: join('app.log'),
                        maxLogSize: 1073741824,
                        numBackups: 3
                    },
                    {
                        type: 'dateFile',
                        filename: join('./app/app.log'),
                        pattern: '-yyyy-MM-dd.log'
                    },
                    {
                        type: 'logLevelFilter',
                        level: 'ERROR',
                        appender: {
                            type: 'file',
                            filename: join('./errors.log')
                        }
                    },
                    {
                        type: 'file',
                        filename: join('./cluster.log'),
                        category: 'cluster'
                    }
                ]
            }
            break;
        case 'test':
        case 'experience':
        case 'production':
        default:
            config = {
                appenders: [
                    {
                        type: 'console'
                    },
                    {
                        type: 'file',
                        filename: join('app.log'),
                        maxLogSize: 1073741824,
                        numBackups: 3
                    },
                    {
                        type: 'dateFile',
                        filename: join('./app/app.log'),
                        pattern: '-yyyy-MM-dd.log'
                    },
                    {
                        type: 'logLevelFilter',
                        level: 'ERROR',
                        appender: {
                            type: 'file',
                            filename: join('./errors.log')
                        }
                    },
                    {
                        type: 'file',
                        filename: join('./cluster.log'),
                        category: 'cluster'
                    }
                ]
            }
    }
    return config;
})(NODE_ENV);