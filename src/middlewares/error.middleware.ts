import { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/logger';

import { HttpException } from '../exceptions/httpException';
import { INTERNAL_ERROR } from '../constants/httpResult';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const code: number = error.code || INTERNAL_ERROR.code;
    const message: string = error.message || INTERNAL_ERROR.message;

    logger.error(`📕[ERROR] ${code} ${message}`);

    res.status(200).json({ code, message, result: {} });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
