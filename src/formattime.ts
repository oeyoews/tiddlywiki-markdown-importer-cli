import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default (time) => {
  const timeFormat = "YYYYMMDDHHMMssSSS";
  return dayjs(time).utc().format(timeFormat);
};
