/**
 * Created by wt on 2017/7/20.
 */


const router = require('express').Router();
const cityServer = require('../../service/cityInfo');
// const joiValidator = require('../../utils/joiValidator');
// const Joi = require('joi');

//  获取所有的城市信息
router.get('/', (req, res) => {
    cityServer.getEnabledCities({})
        .then((data)=> {
            res.success(data)
        })
        .catch((error)=> {
            res.error(error)
        })
});

module.exports = router;