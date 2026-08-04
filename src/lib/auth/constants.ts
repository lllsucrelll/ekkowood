export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

export const ADMIN_SESSION_COOKIE = "ekko_admin_session";
export const MERCHANT_SESSION_COOKIE = "ekko_merchant_session";

export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export const ADMIN_2FA_CHALLENGE_COOKIE = "ekko_admin_2fa_challenge";
export const TWO_FACTOR_CHALLENGE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
export const MAX_TOTP_ATTEMPTS = 5;
