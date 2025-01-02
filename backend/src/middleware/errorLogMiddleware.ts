import { Request, Response, NextFunction } from 'express';

const errorLogMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
