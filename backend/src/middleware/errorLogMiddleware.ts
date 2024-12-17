import { Request, Response, NextFunction } from 'express';

const errorLogMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on('finish', () => {
    if (res.statusCode !== 200) {
      const duration = Date.now() - startTime;
      console.log(
        `${req.method} ${req.originalUrl} - Status: ${res.statusCode}`
      );
    }
  });

  next();
};

export default errorLogMiddleware;
