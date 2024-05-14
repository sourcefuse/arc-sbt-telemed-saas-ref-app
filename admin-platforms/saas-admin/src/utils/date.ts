import moment from 'moment';

export function isRecent(date: Date | string, diffInDays = 2) {
  const now = moment();
  const targetDate = moment(date);
  const diff = now.diff(targetDate, 'days');
  return diff <= diffInDays;
}
