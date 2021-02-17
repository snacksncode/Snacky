import { mapNumber } from "./generic";

interface ProgressBarOptions {
  limit: number;
  current: number;
  emptyChar: string;
  filledChar: string;
  headChar: string;
  width?: number;
}

export default function progressBar(options: ProgressBarOptions) {
  let { limit, current, emptyChar, filledChar, width, headChar } = options;
  if (!width) width = limit;

  current = mapNumber(current, 0, limit, 0, width);

  let progressString = `[${filledChar.repeat(current - 1)}${headChar}${emptyChar.repeat(
    width - current
  )}]`;
  return progressString;
}
