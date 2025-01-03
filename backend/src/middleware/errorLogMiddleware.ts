import { RequestHandler } from 'express';

const errorLogMiddleware: RequestHandler = async (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400 && res.statusCode < 600) {
      console.log(
        `${req.method} ${req.originalUrl} - Status: ${res.statusCode}`
      );
    }
  });

  next();
};

export default errorLogMiddleware;
