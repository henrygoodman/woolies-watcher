import { RequestHandler } from 'express';

const errorLogMiddleware: RequestHandler = async (req, res, next) => {
  const capturedRequestBody = req.body;
  res.locals.capturedRequestBody = capturedRequestBody;

  const originalJson = res.json;
  res.json = function (body) {
    res.locals.responseBody = body;
    return originalJson.call(this, body);
  };

  res.on('finish', () => {
    if (res.statusCode >= 400 && res.statusCode < 600) {
      const logMessage = [
        `${req.method} ${req.originalUrl} - Status: ${res.statusCode}`,
      ];

      if (res.statusCode >= 400 && res.statusCode < 500) {
        logMessage.push(
          `Request Body: ${
            res.locals.capturedRequestBody
              ? JSON.stringify(res.locals.capturedRequestBody, null, 2)
              : 'No request body captured'
          }`
        );
      }

      logMessage.push(
        `Response Body: ${
          res.locals.responseBody
            ? JSON.stringify(res.locals.responseBody, null, 2)
            : 'No response body captured'
        }`
      );

      console.log(logMessage.join('\n'));
    }
  });

  next();
};

export default errorLogMiddleware;
