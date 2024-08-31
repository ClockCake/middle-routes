const express = require('express');
const router = express.Router();
const { ResponseBuilder, StatusCode } = require('../utils/response');


  
router.post('/login', async (req, res) => {
  const { phone, verificationCode } = req.body;

  if (!phone || !verificationCode) {
    return res.status(StatusCode.BAD_REQUEST)
              .json(ResponseBuilder.badRequest('手机号和验证码都是必需的'));
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

    // 选项1：排除 _id 字段
    const { _id, ...userWithoutId } = user;
    // 返回用户信息
    res.json(ResponseBuilder.success(userWithoutId, '登录成功'));
  } catch (error) {
    console.error('登录过程中发生错误:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR)
       .json(ResponseBuilder.error('服务器内部错误'));
  }
});

module.exports = router;
