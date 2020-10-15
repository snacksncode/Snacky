const clampNumber = (num: number, min: number, max: number): number => {
  if (num > max) { return max }
  else if (num < min) { return min }
  else { return num }
}
export default clampNumber;