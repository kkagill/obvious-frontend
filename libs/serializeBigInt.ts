// Adding the BigInt.prototype.toJSON method globally
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Utility function to serialize objects with BigInt
export function serializeBigInt(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}
