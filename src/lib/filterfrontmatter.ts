export default function filterNonStringValues(obj) {
  return Object.keys(obj)
    .filter((key) => typeof obj[key] === "string")
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
}
