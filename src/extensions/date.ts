export default {};

declare global {
  interface Date {
    format(format: string): string;
    addDays(days: number): Date;
    addHours(hours: number): Date;
    addMinutes(minutes: number): Date;
    addSeconds(seconds: number): Date;
    isToday(): boolean;
    clone(): Date;
    isAnotherMonth(date: Date): boolean;
    isWeekend(): boolean;
    isSameDate(date: Date): boolean;
  }

  interface DateConstructor {
    parseAs(format: string, sdate: string): Date;
    today(): string;
    getTodayHash(): string;
  }
}

Date.prototype.format = function (format: string): string {
  let pad = (number: number): string =>
    number < 10 ? '0' + number : number.toString();
  try {
    format = format.replace('YYYY', this.getFullYear().toString());
    format = format.replace('YY', this.getFullYear().toString().slice(2, 4));
    format = format.replace('MM', pad(this.getMonth() + 1));
    format = format.replace('dd', pad(this.getDate()));
    format = format.replace('hh', pad(this.getHours()));
    format = format.replace('mm', pad(this.getMinutes()));
    format = format.replace('ss', pad(this.getSeconds()));
    format = format.replace('ii', pad(this.getMilliseconds()));
  } catch (e) {
    console.log(e);
  }

  return format;
};

Date.today = function () {
  const now = new Date();
  const date_now = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  ).format('YYYY-MM-ddThh:mm:ss.ii');

  return date_now;
};

Date.getTodayHash = function () {
  return new Date().format('ddMMYYYY_hhmmss');
};

Date.parseAs = function (format: string, sdate: string): Date {
  const templates = {
    YYYY: (d, v) => d.setFullYear(v),
    MM: (d, v) => d.setMonth(v),
    dd: (d, v) => d.setDate(v),
    mm: (d, v) => d.setMinutes(v),
    ss: (d, v) => d.setSeconds(v),
    ii: (d, v) => d.setMilliseconds(v),
  };

  const target_date = new Date(Date.now());

  Object.entries(templates).forEach(([part, setter]) => {
    let part_index = format.indexOf(part);
    let value =
      part_index >= 0
        ? Number.parseInt(sdate.substr(part_index, part.length))
        : 0;

    value = part == 'MM' ? value - 1 : value;
    templates[part](target_date, value);
  });

  return target_date;
};

Date.prototype.addDays = function (days: number): Date {
  if (!days) return this;

  let date = this;
  date.setDate(date.getDate() + days);

  return date;
};

Date.prototype.addHours = function (hours: number): Date {
  if (!hours) return this;

  let date = this;
  date.setHours(date.getHours() + hours);

  return date;
};

Date.prototype.addMinutes = function (minutes: number): Date {
  if (!minutes) return this;

  let date = this;
  date.setMinutes(date.getMinutes() + minutes);

  return date;
};

Date.prototype.addSeconds = function (seconds: number): Date {
  if (!seconds) return this;

  let date = this;
  date.setSeconds(date.getSeconds() + seconds);

  return date;
};

Date.prototype.isToday = function (): boolean {
  let today = new Date();
  return this.isSameDate(today);
};

Date.prototype.clone = function (): Date {
  return new Date(this);
};

Date.prototype.isAnotherMonth = function (date: Date): boolean {
  return date && this.getMonth() !== date.getMonth();
};

Date.prototype.isWeekend = function (): boolean {
  return this.getDay() === 0 || this.getDay() === 6;
};

Date.prototype.isSameDate = function (date: Date): boolean {
  return (
    date &&
    this.getFullYear() === date.getFullYear() &&
    this.getMonth() === date.getMonth() &&
    this.getDate() === date.getDate()
  );
};
