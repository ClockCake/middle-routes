const express = require('express');
const router = express.Router();
const { ResponseBuilder, StatusCode } = require('../utils/response');

function checkVerificationCode(phone, code) {
    return code === '1234';
  }
  
router.post('/login', (req, res) => {
    const { phone, verificationCode } = req.body;
  
    if (!phone || !verificationCode) {
      return res.status(StatusCode.BAD_REQUEST)
                .json(ResponseBuilder.badRequest('手机号和验证码都是必需的'));
    }
  
    if (checkVerificationCode(phone, verificationCode)) {
      res.json(ResponseBuilder.success({phone}, '登录成功'));
    } else {
      res.status(StatusCode.UNAUTHORIZED)
         .json(ResponseBuilder.unauthorized('验证码错误或已过期'));
    }
});

module.exports = router;
