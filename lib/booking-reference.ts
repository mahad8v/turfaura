import { randomInt } from "node:crypto";

// Excludes visually-ambiguous characters (0/O, 1/I/L) so references stay easy
// to read back over the phone or copy from WhatsApp.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LENGTH = 6;
const PREFIX = "TA-";

export function generateBookingReference(): string {
  let code = "";
  for (let i = 0; i < LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${PREFIX}${code}`;
}
