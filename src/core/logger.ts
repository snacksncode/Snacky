const time = () => {
  const now = new Date();
  const LOCALE = "en-US";
  const dateString = now.toLocaleDateString(LOCALE, { dateStyle: "short" });
  const timeString = now.toLocaleTimeString(LOCALE, { timeStyle: "medium" });
  return `${dateString} ${timeString}`;
};

const log = (prefix: string, message: string) => {
  console.log(`${prefix} \x1b[36m${time()}\x1b[0m`, message);
};

export const info = (namespace: string, message: any) => {
  log(`\x1b[32m[${namespace}: INFO]\x1b[0m`, message);
};

export const error = (namespace: string, message: any) => {
  log(`\x1b[1;31m[${namespace}: ERROR]\x1b[0m`, message);
};

export const debug = (namespace: string, message: any) => {
  log(`\x1b[33m[${namespace}: DEBUG]\x1b[0m`, message);
};

export default { info, debug, error };
