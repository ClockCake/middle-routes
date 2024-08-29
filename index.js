// 引入 Express
const express = require('express');
const authRoutes = require('./routes/auth');
const { createResponse } = require('./utils/response');
const app = express();

// 注册全局中间件 express.json()，用于解析请求体
app.use(express.json()); 

app.use('/auth', authRoutes);

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(createResponse(500, 'Internal Server Error'));
});

// 启动服务器并监听端口
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});