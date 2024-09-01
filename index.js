const express = require('express'); // 引入 Express 框架
const publicRoutes = require('./routes/login'); // 引入公开路由
const authRoutes = require('./routes/user'); // 引入保护路由
const { createResponse, ResponseBuilder, StatusCode } = require('./utils/response'); // 导入 StatusCode
const { MongoClient } = require('mongodb'); // 引入 MongoDB 客户端
const jwt = require('jsonwebtoken'); // 引入 JWT 模块
const app = express(); // 创建 Express 应用实例
require('dotenv').config(); // 引入 dotenv 模块，用于读取环境变量


let db; // 声明全局变量 db，用于存储数据库连接

// 连接到 MongoDB 的异步函数
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5秒服务器选择超时
      connectTimeoutMS: 10000, // 10秒连接超时
    });
    console.log("Successfully connected to MongoDB");
    db = client.db(process.env.DB_NAME);
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // 连接失败时退出程序
  }
}

// 验证 JWT 令牌的中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(StatusCode.UNAUTHORIZED)
              .json(ResponseBuilder.error('未提供认证令牌', StatusCode.UNAUTHORIZED));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(StatusCode.FORBIDDEN)
                .json(ResponseBuilder.error('无效的令牌', StatusCode.FORBIDDEN));
    }

    // 检查 token 是否快要过期（如果剩余有效期小于 3 天）
    const tokenExp = user.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpire = tokenExp - currentTime;
    const threeDaysInSeconds = 3 * 24 * 60 * 60; // 3天的秒数
    const twoWeeksInSeconds = 14 * 24 * 60 * 60; // 2周的秒数

    if (timeUntilExpire < threeDaysInSeconds) {
      // 重置 token 的有效期为2周
      user.exp = currentTime + twoWeeksInSeconds;
      const refreshedToken = jwt.sign(user, process.env.JWT_SECRET);

      // 在响应头中设置刷新后的 token
      res.setHeader('Authorization', 'Bearer ' + refreshedToken);
    }

    req.user = user;
    next();
  });
}


// 启动服务器的异步函数
async function startServer() {
  await connectToDatabase(); // 等待数据库连接成功

  // 注册全局中间件 express.json()，用于解析 JSON 请求体
  app.use(express.json());

  // 将 MongoDB 数据库对象添加到每个请求对象中
  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  // 日志中间件
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // 错误处理中间件
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(INTERNAL_SERVER_ERROR).json(createResponse(false, 'Internal Server Error'));
  });

  // 公开的路由
  app.use('/public', publicRoutes);
  // 保护的路由
  app.use('/auth', authenticateToken, authRoutes);


  // 启动服务器并监听端口
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// 调用启动服务器函数并捕获可能的错误
startServer().catch(console.error);