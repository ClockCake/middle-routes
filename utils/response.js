// 统一返回结构体
const StatusCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

function createResponse(code, msg, data = Object.create(null)) {
    return {
      code,
      msg,
      data
    };
}

const ResponseBuilder = {
  success: (data, msg = 'Success') => createResponse(StatusCode.OK, msg, data),
  error: (msg, code = StatusCode.INTERNAL_SERVER_ERROR) => createResponse(code, msg),
  badRequest: (msg = 'Bad Request') => createResponse(StatusCode.BAD_REQUEST, msg),
  unauthorized: (msg = 'Unauthorized') => createResponse(StatusCode.UNAUTHORIZED, msg),
  forbidden: (msg = 'Forbidden') => createResponse(StatusCode.FORBIDDEN, msg),
  notFound: (msg = 'Not Found') => createResponse(StatusCode.NOT_FOUND, msg),
};

module.exports = { ResponseBuilder, StatusCode, createResponse };
