/**
 * Mock auth service — swap for Firebase / backend later.
 * Phone OTP is simulated locally for Part 2.
 */

export const DEFAULT_COUNTRY_CODE = '+91';
export const OTP_RESEND_SECONDS = 30;

export function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

export function formatPhoneDisplay(countryCode: string, phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 5) {
    return `${countryCode} ${digits}`.trim();
  }
  return `${countryCode} ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export async function sendOtp(_phone: string): Promise<{ ok: true }> {
  // Simulate network latency for a native feel.
  await delay(450);
  return { ok: true };
}

export async function verifyOtp(code: string): Promise<{ ok: boolean; error?: string }> {
  await delay(500);
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: 'Enter the 6-digit code.' };
  }
  // Accept any valid 6-digit OTP until a real backend exists.
  return { ok: true };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
