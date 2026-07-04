import bcrypt from "bcryptjs";

const OTP_LENGTH = 4;
export const OTP_TTL_MINUTES = 10;
const OTP_SALT_ROUNDS = 10;

export function generateOtp(): string {
  // Cryptographically fine for OTP purposes; zero-padded 4-digit code.
  const max = 10 ** OTP_LENGTH;
  const code = Math.floor(Math.random() * max);
  return code.toString().padStart(OTP_LENGTH, "0");
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, OTP_SALT_ROUNDS);
}

export async function compareOtp(otp: string, otpHash: string): Promise<boolean> {
  return bcrypt.compare(otp, otpHash);
}

export function otpExpiryDate(): Date {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}