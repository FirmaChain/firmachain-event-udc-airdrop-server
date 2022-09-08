import moment from 'moment';

export const getNowFormat = (): string => {
  return moment.utc().format('YYYY-MM-DD HH:mm:ss');
};

export const getNowTime = (): number => {
  return moment.utc().toDate().getTime();
};
