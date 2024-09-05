const { body } = require('express-validator');
exports.loginValidator = [
    body('phone').isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
    body('verificationCode').isLength({ min: 6, max: 6 }).withMessage('验证码长度错误'),
]
exports.registerValidator
