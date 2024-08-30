# Express 中间层项目

这是一个基于 Node.js 和 Express 构建的中间层项目，用于处理与 MongoDB 的数据交互，并为 iOS 前端提供 RESTful API。

## 功能

- 用户注册
- 用户登录（JWT 认证）
- 受保护的用户资料获取

## 目录结构

```plaintext
.
├── app.js          # Express 服务器主文件
├── models          # 包含 Mongoose 数据模型
│   └── user.js
├── routes          # 包含 Express 路由
│   └── auth.js
├── config          # 配置文件
│   └── db.js       # 数据库连接设置
├── package.json    # 项目依赖和脚本
└── README.md       # 项目文档
