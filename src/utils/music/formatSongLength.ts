function formatSongLength(lengthInSeconds: number) {
  let seconds = Math.floor(lengthInSeconds % 60);
  let minutes = Math.floor((lengthInSeconds / 60) % 60);
  let hours = Math.floor((lengthInSeconds / (60 * 60)) % 24);

  let _seconds = `${`00${seconds}`.toString().substr(-2)}`;
  let _minutes = `${`00${minutes}`.toString().substr(-2)}`;
  let _hours = `${`00${hours}`.toString().substr(-2)}`;

  if (hours) return `${_hours}:${_minutes}:${_seconds}`;
  else if (minutes) return `${_minutes}:${_seconds}`;
  else return `00:${_seconds}`;
}

export default formatSongLength;
