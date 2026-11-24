/**
 * "Delete my account": removes the person's Firebase sign-in, their row in the
 * wellness contacts database, and everything Vidura Life keeps on this device.
 *
 * If this device has no saved sign-in (for example, someone who confirmed their
 * email before this feature existed), they confirm by email first: the link signs
 * them in, and the deletion finishes as soon as it is opened.
 */
import { EMAIL_LINK_ENABLED, deleteFirebaseAccount, freshIdToken, savePending, sendSignInLink } from "./emailLink";
import { isNative, setReminders } from "./native";
import { deleteContact } from "./remote";

const DELETE_FLAG = "vidura.deleteRequested";

export type DeleteResult = "deleted" | "needs-email" | "failed";

/** Removes every vidura.* key from this device. */
export function wipeLocal(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("vidura.")) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage blocked: nothing persisted */
  }
  if (isNative) void setReminders(false, []);
}

export async function deleteAccount(): Promise<DeleteResult> {
  if (!EMAIL_LINK_ENABLED) {
    // No sign-in service in this build: nothing is stored anywhere but here.
    wipeLocal();
    return "deleted";
  }
  const token = await freshIdToken();
  if (!token) return "needs-email";
  // The contact row first: the server checks the token, which stops working once the account is gone.
  const contactGone = await deleteContact(token);
  const accountGone = await deleteFirebaseAccount(token);
  if (!contactGone || !accountGone) return "failed";
  wipeLocal();
  return "deleted";
}

/** No saved sign-in: email a confirmation link; opening it finishes the deletion. */
export async function requestDeleteByEmail(name: string, email: string): Promise<boolean> {
  savePending({ name, email });
  const r = await sendSignInLink(email);
  if (!r.ok) return false;
  try {
    localStorage.setItem(DELETE_FLAG, new Date().toISOString());
  } catch {
    return false;
  }
  return true;
}

export function deleteRequested(): boolean {
  try {
    const at = Date.parse(localStorage.getItem(DELETE_FLAG) || "");
    return Number.isFinite(at) && Date.now() - at < 24 * 3600 * 1000;
  } catch {
    return false;
  }
}

export function cancelDeleteRequest(): void {
  try {
    localStorage.removeItem(DELETE_FLAG);
  } catch {
    /* ignore */
  }
}
