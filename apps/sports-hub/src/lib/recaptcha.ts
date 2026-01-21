/**
 * reCAPTCHA v3 Integration for SportsHub
 * Prevents bot voting and ensures vote authenticity
 */

// Client-side: Generate reCAPTCHA token
export async function generateRecaptchaToken(action: string = 'vote'): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject('reCAPTCHA only works in browser');
      return;
    }

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured - using bypass mode');
      resolve('bypass_token');
      return;
    }

    // @ts-ignore - grecaptcha is loaded from script
    if (!window.grecaptcha || !window.grecaptcha.ready) {
      console.warn('reCAPTCHA not loaded - using bypass mode');
      resolve('bypass_token');
      return;
    }

    // @ts-ignore
    window.grecaptcha.ready(() => {
      // @ts-ignore
      window.grecaptcha
        .execute(siteKey, { action })
        .then((token: string) => {
          resolve(token);
        })
        .catch((error: Error) => {
          console.error('reCAPTCHA error:', error);
          reject(error);
        });
    });
  });
}

// Server-side: Verify reCAPTCHA token (Cloud Function)
export async function verifyRecaptchaToken(token: string): Promise<{
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  error?: string;
}> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn('reCAPTCHA secret key not configured - bypassing verification');
    return { success: true, score: 1.0 };
  }

  if (token === 'bypass_token') {
    // Development bypass
    return { success: true, score: 1.0, action: 'vote' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    return {
      success: data.success,
      score: data.score,
      action: data.action,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
      error: data['error-codes']?.join(', '),
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      error: 'Verification request failed',
    };
  }
}

/**
 * Score thresholds for vote acceptance
 * 0.0 - 0.4: Likely bot
 * 0.5 - 0.6: Suspicious
 * 0.7 - 1.0: Likely human
 */
export const RECAPTCHA_THRESHOLD = 0.5;

export function isValidRecaptchaScore(score: number): boolean {
  return score >= RECAPTCHA_THRESHOLD;
}
