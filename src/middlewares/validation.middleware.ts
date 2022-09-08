import { RequestHandler, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { HttpException } from '../exceptions/httpException';
import { UNDEFINED_KEY } from '../constants/httpResult';

const validationMiddleware = (type: any, value: string | 'body' | 'query' | 'params' = 'body'): RequestHandler => {
  return (req: any, res: Response, next: NextFunction) => {
    validate(plainToInstance(type, req[value])).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        next(new HttpException(UNDEFINED_KEY.code, UNDEFINED_KEY.message));
      } else {
        next();
      }
    });
  };
};

export default validationMiddleware;
