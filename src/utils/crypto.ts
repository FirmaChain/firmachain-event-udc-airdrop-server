import CryptoJS from 'crypto-js';

export const getDecryptString = (value: string, secret: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(value, secret);
    const result = bytes.toString(CryptoJS.enc.Utf8);

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
