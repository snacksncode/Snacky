function formatMs(ms: number) {
  let seconds: number | string = Math.floor((ms / 1000) % 60);
  let minutes: number | string = Math.floor((ms / (1000 * 60)) % 60);
  let hours: number | string = Math.floor((ms / (1000 * 60 * 60)) % 24);

  if (hours) return `${hours} hrs, ${minutes} min, ${seconds} sec`;
  else if (minutes) return `${minutes} min, ${seconds} sec`;
  else return `${seconds} sec`;
}
export default formatMs;
