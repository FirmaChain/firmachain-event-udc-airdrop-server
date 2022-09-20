import { createClient } from 'redis';

import { logger } from '../utils/logger';

class StoreService {
  constructor(
    public config: { url: string; password: string },
    public client = createClient({ url: config.url, password: config.password })
  ) {
    this.initialize();
  }

  public async setMessage(key: string, message: string): Promise<void> {
    await this.client.set(key, message);
  }

  public async getMessage(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  public async removeMessage(key: string): Promise<void> {
    await this.client.del(key);
  }

  public async hsetMessage(key: string, field: string | number, message: string | number): Promise<void> {
    await this.client.hSet(key, field, message);
  }

  public async hget(key: string, field: string): Promise<any> {
    return await this.client.hGet(key, field);
  }

  public async hgetAll(key: string): Promise<any> {
    return await this.client.hGetAll(key);
  }

  public async zAdd(key: string, time: number, value: string): Promise<void> {
    await this.client.zAdd(key, { score: time, value });
  }

  public async zTopTen(key: string): Promise<any> {
    return await this.client.zRangeWithScores(key, 0, 10, { REV: true });
  }

  public async push(key: string, address: string): Promise<void> {
    await this.client.lPush(key, address);
  }

  public async pop(key: string): Promise<string | null> {
    return await this.client.rPop(key);
  }

  private initialize(): void {
    this.client.on('error', (e) => {
      logger.error(e);
    });
    this.client.connect();
    this.client.on('ready', () => {
      logger.debug(`Redis Connected ${this.config.url}`);
    });
  }
}

export default StoreService;
