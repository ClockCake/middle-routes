const express = require('express');
const router = express.Router();
const { ResponseBuilder, StatusCode } = require('../utils/response');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// JWT 密钥，应该存储在环境变量中
const JWT_SECRET = process.env.JWT_SECRET;

// 生成 JWT token 的函数
function generateToken(user) {
  return jwt.sign(
    { userId: user._id, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '14d' } // token 有效期为 14 天
  );
}


router.post('/login',[
    body('phone').isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  ],
  async (req, res) => {
  const { phone, verificationCode } = req.body;

   // 获取校验结果
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     // 如果校验失败，返回 400 和错误信息
     return res.status(StatusCode.BAD_REQUEST)
                .json(ResponseBuilder.badRequest(errors.array()[0].msg));
   }

  try {
    // 确保数据库连接存在
    if (!req.db) {
      throw new Error('Database connection not available');
    }

    // 获取用户集合
    const usersCollection = req.db.collection('users');

    // 查找用户
    let user = await usersCollection.findOne({ phone });

    if (!user) {
      // 如果用户不存在，创建新用户
      const newUser = {
        phone,
        createdAt: new Date(),
        sex: 0, // 0: 未知, 1: 男, 2: 女
        nickname: '',
        avatar: '',
        bio: '',
      };

      const result = await usersCollection.insertOne(newUser);
      
      // 获取插入的文档
      user = await usersCollection.findOne({ _id: result.insertedId });

      if (!user) {
        throw new Error('Failed to retrieve newly created user');
      }
    }
    const token = generateToken(user);

    // 排除 _id 字段
    const { _id, ...userWithoutId } = user;
    // 生成 JWT token,自定义返回结构体
    const responseData = {
      ...userWithoutId,
      token,
    };
    // 返回用户信息
    res.json(ResponseBuilder.success(responseData, '登录成功'));
  } catch (error) {
    console.error('登录过程中发生错误:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR)
       .json(ResponseBuilder.error('服务器内部错误'));
  }
});

module.exports = router;
