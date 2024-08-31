const express = require('express'); // 引入 Express 框架
const authRoutes = require('./routes/auth'); // 引入认证路由
const { createResponse } = require('./utils/response'); // 引入响应构造函数
const { MongoClient } = require('mongodb'); // 引入 MongoDB 客户端

const app = express(); // 创建 Express 应用实例

// MongoDB 的连接 URL 和数据库名称
const url = 'mongodb://portainer.iweekly.top:27017';
const dbName = 'demo';

let db; // 声明全局变量 db，用于存储数据库连接

// 连接到 MongoDB 的异步函数
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(url, {
      serverSelectionTimeoutMS: 5000, // 5秒服务器选择超时
      connectTimeoutMS: 10000, // 10秒连接超时
    });
    console.log("Successfully connected to MongoDB");
    db = client.db(dbName);
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

  // 错误处理中间件
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json(createResponse(false, 'Internal Server Error'));
  });

  // 使用认证路由
  app.use('/auth', authRoutes);

  // 启动服务器并监听端口
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// 调用启动服务器函数并捕获可能的错误
startServer().catch(console.error);