import { Request, Response } from 'express';

import StoreService from '../services/store.service';
import AirdropService from '../services/airdrop.service';

import { resultLog } from '../utils/logger';
import { SUCCESS, INVALID_KEY } from '../constants/httpResult';

class AirdropController {
  constructor(public storeService: StoreService, private airdropService = new AirdropService(storeService)) {
    this.airdropService.initAirdropQR();
  }

  public getAirdropQR = (req: Request, res: Response): void => {
    this.airdropService
      .getAirdropQR()
      .then((result) => {
        resultLog(result);
        res.send({ ...SUCCESS, result });
      })
      .catch(() => {
        res.send({ ...INVALID_KEY, result: {} });
      });
  };

  public getLatestTransaction = (req: Request, res: Response): void => {
    this.airdropService
      .getLatestTransaction()
      .then((result) => {
        resultLog(result);
        res.send({ ...SUCCESS, result });
      })
      .catch(() => {
        res.send({ ...INVALID_KEY, result: {} });
      });
  };

  public callback = (req: Request, res: Response): void => {
    const { requestKey, type, signData } = req.body;

    this.airdropService
      .callback(requestKey, type, signData)
      .then((result) => {
        resultLog(result);
        res.send({ ...SUCCESS, result });
      })
      .catch(() => {
        res.send({ ...INVALID_KEY, result: {} });
      });
  };
}

export default AirdropController;
