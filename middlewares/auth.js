const jwt = require('jsonwebtoken');
const { ResponseBuilder, StatusCode } = require('../utils/response');

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

module.exports = authenticateToken;