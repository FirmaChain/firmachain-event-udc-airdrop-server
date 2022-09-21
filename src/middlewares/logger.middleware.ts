import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path.includes('/requests') === false && req.path !== '/') {
    logger.debug(['📘[START]', req.method, req.path, JSON.stringify(req.body)].join(' '));
  }
  next();
};

export default loggerMiddleware;
