import { mapNumber } from "./generic";

interface ProgressBarOptions {
  limit: number;
  current: number;
  emptyChar: string;
  filledChar: string;
  width?: number;
}

export default function progressBar(options: ProgressBarOptions) {
  let { limit, current, emptyChar, filledChar, width } = options;
  if (!width) width = limit;

  current = mapNumber(current, 0, limit, 0, width);

  let progressString = `[${filledChar.repeat(current)}${emptyChar.repeat(width - current)}]`;
  return progressString;
}

progressBar({
  current: 100,
  limit: 300,
  emptyChar: "-",
  filledChar: "=",
  width: 30,
});
