import { NextFunction, Request, Response } from 'express';

import { SUCCESS } from '../constants/httpResult';

class IndexController {
  public index = (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.send({ code: SUCCESS.code, message: SUCCESS.message, result: {} });
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
