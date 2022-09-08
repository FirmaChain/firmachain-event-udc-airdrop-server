export class HttpException extends Error {
  constructor(public code: number, public message: string) {
    super(message);
  }
}
