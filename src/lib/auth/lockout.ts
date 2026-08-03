import "server-only";
import { MAX_FAILED_LOGIN_ATTEMPTS, LOGIN_LOCKOUT_MS } from "./constants";

type LockableAccount = {
  failedLoginCount: number;
  lockedUntil: Date | null;
};

export function isLockedOut(account: LockableAccount): boolean {
  return !!account.lockedUntil && account.lockedUntil > new Date();
}

/** Fields to persist after a failed login attempt. */
export function nextFailedLoginState(account: LockableAccount): {
  failedLoginCount: number;
  lockedUntil: Date | null;
} {
  const failedLoginCount = account.failedLoginCount + 1;
  const lockedUntil =
    failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS
      ? new Date(Date.now() + LOGIN_LOCKOUT_MS)
      : account.lockedUntil;
  return { failedLoginCount, lockedUntil };
}

/** Fields to persist after a successful login. */
export const RESET_LOGIN_STATE = {
  failedLoginCount: 0,
  lockedUntil: null as Date | null,
};
