import { v4 } from 'uuid';
import moment from 'moment';

import StoreService from './store.service';
import { ConnectService } from './connect.service';
import { logger } from '../utils/logger';

import {
  RELAY,
  PROJECT_SECRET_KEY,
  REQUEST_PREFIX,
  ADDRESSBOOK,
  AIRDROP_QUEUE,
  AIRDROP_RESULT,
  AIRDROP_MESSAGE,
  STATION_IDENTITY,
  EXPIRED_EVENT,
} from '../constants/airdrop';

class AirdropService {
  constructor(
    public storeService: StoreService,
    private connectService: ConnectService = new ConnectService(RELAY),
    private currentRequestKey: string = ''
  ) {}

  public async getAirdropQR(): Promise<{ qrcode: string }> {
    try {
      return {
        qrcode: `${STATION_IDENTITY}://${this.currentRequestKey}`,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async getLatestTransaction(): Promise<Array<{ date: string; address: string; transactionHash: string }>> {
    try {
      const transactionList = await this.storeService.zTopTen(AIRDROP_RESULT);

      let result = [];

      for (let transaction of transactionList) {
        const date = moment(transaction.score).utc().format('YYYY-MM-DD HH:mm:ss');
        const jsonData = JSON.parse(transaction.value);
        const address = jsonData.address;
        const transactionHash = jsonData.transactionHash;
        result.push({
          date,
          address,
          transactionHash,
        });
      }

      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async initAirdropQR(): Promise<void> {
    try {
      if (EXPIRED_EVENT) {
        this.currentRequestKey = 'EXPIRED';
      } else {
        const redisData = await this.storeService.client.keys(`${REQUEST_PREFIX}*`);

        if (redisData.length > 0) {
          this.currentRequestKey = redisData[0].replace(`${REQUEST_PREFIX}`, '');
        } else {
          const message: string = v4();
          const info: string = AIRDROP_MESSAGE;
          const session = await this.connectService.connect(PROJECT_SECRET_KEY);
          const qrcode = await this.connectService.getQRCodeForArbitarySign(session, message, info);
          const requestKey = qrcode.replace('sign://', '');

          await this.addRequest(requestKey, message);

          this.currentRequestKey = requestKey;
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async callback(requestKey: string, type: number, signData: any): Promise<void> {
    if (type === 0) {
      const signRawData = signData.rawData;
      const requestData = await this.getRequest(requestKey);
      const originMessage = requestData.message;

      const isMatch = await this.connectService.verifyArbitary(signRawData, originMessage);
      if (isMatch) {
        const address = signData.address;
        const pubkey = this.connectService.getSingerPubkeyFromSignRaw(signRawData);
        if ((await this.isDuplicateAddress(address)) === false) {
          await this.addRequestCount(requestKey);
          await this.addAddress(address, pubkey);
          await this.storeService.push(AIRDROP_QUEUE, address);

          logger.info(`🚀[AIRDROP] ADD QUEUE ${address} ${2}FCT`);
        }
      }
    }
  }

  private async addRequest(requestKey: string, message: string): Promise<void> {
    await this.storeService.hsetMessage(`${REQUEST_PREFIX}${requestKey}`, 'message', message);
    await this.storeService.hsetMessage(`${REQUEST_PREFIX}${requestKey}`, 'count', 0);
  }

  private async getRequest(requestKey: string): Promise<{ message: string; status: number }> {
    return await this.storeService.hgetAll(`${REQUEST_PREFIX}${requestKey}`);
  }

  private async addRequestCount(requestKey: string): Promise<void> {
    const count = await this.storeService.hget(`${REQUEST_PREFIX}${requestKey}`, 'count');
    await this.storeService.hsetMessage(`${REQUEST_PREFIX}${requestKey}`, 'count', Number(count) + 1);
  }

  private async addAddress(address: string, pubkey: string): Promise<void> {
    await this.storeService.hsetMessage(ADDRESSBOOK, address, pubkey);
  }

  private async isDuplicateAddress(address: string): Promise<boolean> {
    const pubkey = await this.storeService.hget(ADDRESSBOOK, address);
    return pubkey !== null;
  }
}

export default AirdropService;
