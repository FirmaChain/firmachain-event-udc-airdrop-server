import * as dotenv from 'dotenv';
dotenv.config();

import { FirmaSDK } from '@firmachain/firma-js';
import { FIRMA_CONFIG } from './config';
import StoreService from './services/store.service';
import { logger } from './utils/logger';
import { getNowTime } from './utils/date';

import { AIRDROP_QUEUE, AIRDROP_RESULT, AIRDROP_AMOUNT, MNEMONIC, SECRET } from './constants/airdrop';
import { getDecryptString } from './utils/crypto';

const REDIS = process.env.REDIS!;
const REDIS_PASS = process.env.REDIS_PASS!;

class AirdropScheduler {
  constructor(
    private storeService = new StoreService({ url: REDIS, password: REDIS_PASS }),
    private firmaSDK = new FirmaSDK(FIRMA_CONFIG)
  ) {
    this.start();
  }

  private start() {
    this.work();
  }

  private async work() {
    try {
      const address = await this.popAddress();

      if (address !== null) {
        logger.info(`🚀[AIRDROP] SEND START ${address}`);

        const decryptMnemonic = getDecryptString(MNEMONIC, SECRET);
        const airdropWallet = await this.firmaSDK.Wallet.fromMnemonic(decryptMnemonic);
        const result = await this.firmaSDK.Bank.send(airdropWallet, address, Number(AIRDROP_AMOUNT));

        if (result.code !== 0) {
          logger.info(`🚀[AIRDROP] !!!FAILED!!! ${address}`);
          logger.info(result);
        } else {
          await this.writeResult(address, result.transactionHash);

          logger.info(`🚀[AIRDROP] ${address} : ${result.transactionHash}`);
        }

        logger.info(`🚀[AIRDROP] SEND END ${address}`);

        await this.work();
        return;
      } else {
        logger.info(`🚀[AIRDROP] NO ADDRESS`);
      }
    } catch (error) {
      logger.error(error);
    }

    setTimeout(async () => {
      await this.work();
    }, 5000);
  }

  private async popAddress(): Promise<string | null> {
    return await this.storeService.pop(AIRDROP_QUEUE);
  }

  private async writeResult(address: string, transactionHash: string): Promise<void> {
    await this.storeService.zAdd(AIRDROP_RESULT, getNowTime(), JSON.stringify({ address, transactionHash }));
  }
}

new AirdropScheduler();
