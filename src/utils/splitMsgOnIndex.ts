function splitMsgOnLimit(input: string, limit: number): string[] {
  let output: string[] = [];
  while (input.length) {
    output.push(input.substr(0, limit));
    input = input.substr(limit);
  }
  return output;
}

export default splitMsgOnLimit;
