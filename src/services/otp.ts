import { delay } from "./delay";

/** Mock OTP check: any 6 digits except 000000 pass. */
export async function verifyOtp(code: string): Promise<boolean> {
  await delay();
  return /^\d{6}$/.test(code) && code !== "000000";
}
