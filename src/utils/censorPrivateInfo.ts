import { token } from "../config";

interface CensoredData {
  censoredOutput: string;
  tokenPieceDetected: boolean;
}

function checkIfInputContainsTokenPiece(input: string, _token: string): boolean {
  let arrayOfTokenPieces = _token.match(/.{4}/g);
  let containsPiece = false;
  arrayOfTokenPieces.forEach((piece) => {
    if (input.includes(piece)) {
      containsPiece = true;
    }
  });
  return containsPiece;
}

function censorPrivateInfo(input: string): CensoredData {
  let censoredOutput: string = "";
  const privateInfo = [token, process.env.YTTOKEN];
  let tokenPieceDetected = false;
  privateInfo.forEach((privateToken) => {
    if (checkIfInputContainsTokenPiece(input, privateToken)) {
      tokenPieceDetected = true;
    }
    censoredOutput = input.replaceAll(privateToken, "[ Private ]");
  });
  return { censoredOutput, tokenPieceDetected };
}

export default censorPrivateInfo;
