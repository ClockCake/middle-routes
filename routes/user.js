const express = require('express');
const router = express.Router();
const { ResponseBuilder, StatusCode } = require('../utils/response');
const { ObjectId } = require('mongodb');

// 获取用户信息的路由
router.get('/profile', async (req, res) => {
  try {
    // 从认证中间件中获取用户 ID
    const userId = req.user.userId;

    // 获取数据库连接
    const db = req.db;
    const usersCollection = db.collection('users');

    // 查找用户
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(StatusCode.NOT_FOUND)
                .json(ResponseBuilder.error('用户不存在', StatusCode.NOT_FOUND));
    }

    // 移除敏感信息
    const { password,_id, ...safeUserInfo } = user;

    // 返回用户信息
    res.json(ResponseBuilder.success(safeUserInfo, '获取用户信息成功'));
  } catch (error) {
    console.error('获取用户信息时发生错误:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR)
       .json(ResponseBuilder.error('服务器内部错误', StatusCode.INTERNAL_SERVER_ERROR));
  }
});

// 更新用户信息的路由
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nickname, avatar, bio } = req.body;

    const db = req.db;
    const usersCollection = db.collection('users');

    // 更新用户信息
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { nickname, avatar, bio } }
    );

    if (result.matchedCount === 0) {
      return res.status(StatusCode.NOT_FOUND)
                .json(ResponseBuilder.error('用户不存在', StatusCode.NOT_FOUND));
    }

    res.json(ResponseBuilder.success({}, '用户信息更新成功'));
  } catch (error) {
    console.error('更新用户信息时发生错误:', error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR)
       .json(ResponseBuilder.error('服务器内部错误', StatusCode.INTERNAL_SERVER_ERROR));
  }
});

module.exports = router;