const express = require('express');
const mailgun = require('mailgun-js');
const router = express.Router();
const { ResponseBuilder, StatusCode } = require('../utils/response');

// 生成随机验证码
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// 配置 Mailgun
const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  });
// 发送验证码邮件
// 发送验证码邮件（使用模板）
router.post('/send-verification', (req, res) => {
    const { email } = req.body;
    const verificationCode = generateVerificationCode();
  
    const data = {
      from: '<noreply@mail.iweekly.top>',
      to: email,
      subject: '您的验证码',
      template: "verification_email", // 这里使用你在 Mailgun 后台创建的模板名称
      'h:X-Mailgun-Variables': JSON.stringify({
        verification_code: verificationCode,
        user_email: email
        // 你可以在这里添加更多变量，用于模板中的个性化内容
      })
    };
    mg.messages().send(data, (error, body) => {
        if (error) {
          console.error('Error sending email:', error);
          res.status(StatusCode.INTERNAL_SERVER_ERROR)
          .json(ResponseBuilder.error('邮件服务错误'));
        } else {
          console.log('Email sent:', body);
          res.status(StatusCode.OK).json(ResponseBuilder.success({}));
          // 在这里你可能想要将验证码保存到数据库，以便后续验证
        }
    });
});

module.exports = router;