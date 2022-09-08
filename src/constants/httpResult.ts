export interface HttpResult {
  code: number;
  message: string;
}

export const SUCCESS: HttpResult = {
  code: 0,
  message: 'success',
};

export const INTERNAL_ERROR: HttpResult = {
  code: 500,
  message: 'internal error',
};

export const UNAUTHORIZATION: HttpResult = {
  code: 501,
  message: 'unauthorization',
};

export const UNDEFINED_KEY: HttpResult = {
  code: 502,
  message: 'undefined body',
};

export const INVALID_KEY: HttpResult = {
  code: 503,
  message: 'invalid key',
};
