import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default (time: Date) => {
  const timeFormat = "YYYYMMDDHHmmss";
  return dayjs(time).utc().format(timeFormat);
};
