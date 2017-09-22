/**
 * 调用任务的master任务。
 * 调用参数为 task1,tesk2,tesk3 arg0 arg1 arg2
 * 所有task均获取同样的参数（使用apply(this, [arg0,arg1,arg2])）
 * @author 吴秀璞
 * @since 2016年12月17日17:44:34
 * 2016年12月27日14:12:41 吴秀璞 修改Tasks[id]的方式为require(task)方式，以避免不相干任务初始化
 */
/* eslint-disable global-require,no-process-exit */
require('./config/loadConfig');

const _ = require('lodash');
const logger = global.Logger('masterTask');
const moment = require('moment');
const path = require('path');
const TASK_STATUS = {
    PENDING: 0,
    SUCCEED: 1,
    FAILED: -1
};
let orignalArgs = process.argv;
//调用时argv[0]为node路径 argv[1]为masterTask.js路径，argv3为任务 argv4为时间
let taskIds = orignalArgs[2].split(',');
let tasks = [];
let args = orignalArgs.slice(3);
//执行结果
let result = {
    args: args,
    //默认为待处理状态
    status: TASK_STATUS.PENDING,
    tasks: {}
}
//去重
taskIds = _.uniq(taskIds);
let writeSuccess = () => {
    logger.info('--------done--------');
    logger.info(JSON.stringify(result));
    //process.stdout.write(JSON.stringify(result));
    process.exit(1);
}

let writeError = () => {
    logger.info('--------undone--------');
    logger.error(JSON.stringify(result) + '\n');
    //process.stderr.write(JSON.stringify(result));
    process.exit(1);
}

for (let taskId of taskIds) {
    let task;
    //当找到不任务或者此任务有问题时返回没有此任务错误
    try {
        task = require(path.join(__dirname, './tasks/' + taskId + '.js'));
        task = task.task;
        task.id = task.attributes.id;
    } catch (e) {
        logger.error(e, e.message, e.stack);
        task = undefined;
    }
    result.tasks[taskId] = {
        //默认为待处理状态
        status: TASK_STATUS.PENDING,
        message: '',
        error: ''
    };
    if (task) {
        tasks.push(task);
    } else {
        result.status = TASK_STATUS.FAILED;
        result.tasks[taskId].status = TASK_STATUS.FAILED;
        result.tasks[taskId].error = '没有此任务！';
    }
}


if (args.length) {
    //转换请求的几个固定参数
    switch (args[0]) {
        case 'all':
            args[0] = moment().format('YYYY-MM-DD HH:mm:ss');
            break;
        case 'today':
            args[0] = moment().format('YYYY-MM-DD');
            break;
        case 'yesterday':
            args[0] = moment().add(-1, 'd').format('YYYY-MM-DD');
            break;
    }
}

/**
 * 当有任务不存在等问题时终止任务，以防止出现由于手贱导致被依赖项错误的问题
 */
if (result.status !== 0) {
    return writeError();
}

/**
 * 如果没有任务需要执行则终止
 */
if (tasks.length === 0) {
    result.message = '没有任务，所以未执行';
    return writeSuccess();
}

Promise.each(tasks, (task) => {
        return task.execute.apply(this, args)
            .then((message) => {
                result.status = TASK_STATUS.SUCCEED;
                result.tasks[task.id].status = TASK_STATUS.SUCCEED;
                result.tasks[task.id].message = message || '';
            })
            .catch((error) => {
                result.status = TASK_STATUS.FAILED;
                result.tasks[task.id].status = TASK_STATUS.FAILED;
                result.tasks[task.id].error = {
                    message: error.message,
                    stack: error.stack || '',
                    sql: error.sql
                }
                return Promise.reject(error);
            })
    })
    .then(() => {
        return writeSuccess();
    })
    .catch((error) => {
        if (result.status !== TASK_STATUS.FAILED) {
            result.status = TASK_STATUS.FAILED;
            result.message = error.message;
            result.stack = error.stack;
            result.sql = error.sql;
        }
        return writeError();
    })