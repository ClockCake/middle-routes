const express = require('express'); // 引入 Express 框架
const publicRoutes = require('./routes/login'); // 引入公开路由
const mailgunRoutes = require('./middlewares/mailgun'); // 引入邮件路由
const authRoutes = require('./routes/user'); // 引入保护路由
const { createResponse, ResponseBuilder, StatusCode } = require('./utils/response'); // 导入 StatusCode
const { MongoClient } = require('mongodb'); // 引入 MongoDB 客户端
const authenticateToken = require('./middlewares/auth'); // 引入 JWT 验证中间件
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


  // 公开的路由
  app.use('/public', publicRoutes);
  app.use('/mailgun', mailgunRoutes);
  // 保护的路由
  app.use('/auth', authenticateToken, authRoutes);
  

  //未匹配的路由处理
  app.use((req, res, next) => {
    res.status(StatusCode.NOT_FOUND).json(ResponseBuilder.notFound('路由不存在'));
  });


  // 错误处理中间件
  app.use((err, req, res, next) => {
    console.error(err.stack); // 打印错误堆栈信息到控制台（仅限开发阶段）

    // 设置响应状态码，如果错误对象中没有状态码，则默认使用 500
    const statusCode = err.statusCode || 500;

    // 返回 JSON 格式的错误信息
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
      // 仅在开发环境中返回详细的错误堆栈信息
      stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
  });

  // 启动服务器并监听端口
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// 调用启动服务器函数并捕获可能的错误
startServer().catch(console.error);