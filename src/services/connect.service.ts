import axios, { AxiosInstance } from 'axios';
import { FirmaSDK, FirmaUtil } from '@firmachain/firma-js';
import { FIRMA_CONFIG } from '../config';

export interface UserSession {
  projectKey: string;
}

interface ResponseAuthData {
  projectKey: string;
}

interface ResponseQRCodeData {
  data: string;
}

export class ConnectService {
  constructor(
    public relay: string,
    private requestService = new RequestService(relay),
    private firmaSDK = new FirmaSDK(FIRMA_CONFIG)
  ) {}

  public async connect(projectSecretKey: string): Promise<UserSession> {
    try {
      const response: ResponseAuthData = await this.requestService.requestPost<ResponseAuthData>('/v1/projects/auth', {
        projectSecretKey,
      });

      return {
        projectKey: response.projectKey,
      };
    } catch (e) {
      console.log(e);
      throw new Error('Failed Request');
    }
  }

  public async getQRCodeForArbitarySign(session: UserSession, message: string, info: string): Promise<string> {
    try {
      const response: ResponseQRCodeData = await this.requestService.requestPost<ResponseQRCodeData>(
        `/v1/projects/sign`,
        { qrType: 0, type: 0, signer: '', message, info, argument: {}, isMultiple: true },
        { authorization: `Bearer ${session.projectKey}` }
      );

      const QRCode = response.data;

      return QRCode;
    } catch (e) {
      console.log(e);
      throw new Error('Invalid Request');
    }
  }

  public getSingerPubkeyFromSignRaw(rawData: string) {
    try {
      const rawJSON = JSON.parse(rawData);
      return rawJSON.pubkey;
    } catch (error) {}
  }

  public async verifyArbitary(data: string, message: string) {
    return FirmaUtil.experimentalAdr36Verify(JSON.parse(data), message);
  }
}

class RequestService {
  constructor(
    public realy: string,
    private instance: AxiosInstance = axios.create({
      baseURL: realy,
      timeout: 5000,
    })
  ) {}

  async requestPost<T = any>(uri: string, body: any = {}, headers: any = {}): Promise<T> {
    try {
      const response = await this.instance.post(uri, body, { headers });
      if (response.data.code === 0) {
        return response.data.result;
      } else {
        throw new Error(response.data.message);
      }
    } catch (e) {
      throw e;
    }
  }
}
