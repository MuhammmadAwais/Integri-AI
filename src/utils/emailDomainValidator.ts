/**
 * emailDomainValidator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Pre-flight domain validation for the Smart Recovery Gate.
 *
 * Purpose: block obviously fake / black-hole / disposable email domains
 * BEFORE making any Firebase calls, so we skip unnecessary network round-trips
 * and give the user a direct "use the mobile app" message.
 *
 * Logging: every block is console-logged with a structured tag so we can track
 * how many users are hitting domain blocks vs. auth/user-not-found in analytics.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Domain blacklist ("black hole" + common disposable / test domains)
// ─────────────────────────────────────────────────────────────────────────────
const BLACKLISTED_DOMAINS = new Set<string>([
  // RFC-reserved / documentation
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.org",
  "test.net",
  "invalid",
  "localhost",

  // Common dev/placeholder patterns
  "foo.com",
  "bar.com",
  "foobar.com",
  "baz.com",
  "qux.com",
  "domain.com",
  "email.com",
  "myemail.com",
  "myfakemail.com",
  "noemail.com",
  "noreply.com",
  "donotreply.com",
  "placeholder.com",
  "sample.com",
  "demo.com",

  // Well-known disposable / mailbox services
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.org",
  "guerrillamail.net",
  "guerrillamail.de",
  "guerrillamail.info",
  "sharklasers.com",
  "grr.la",
  "spam4.me",
  "trashmail.com",
  "trashmail.me",
  "trashmail.at",
  "trashmail.io",
  "trashmail.net",
  "yopmail.com",
  "yopmail.fr",
  "cool.fr.nf",
  "jetable.fr.nf",
  "nospam.ze.tc",
  "nomail.xl.cx",
  "mega.zik.dj",
  "speed.1s.fr",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "fakeinbox.com",
  "mailnull.com",
  "mailnesia.com",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.ru",
  "tempinbox.com",
  "throwam.com",
  "throwam.net",
  "throwam.org",
  "dispostable.com",
  "discard.email",
  "spam.la",
  "spamavert.com",
  "spamgourmet.com",
  "spamgourmet.net",
  "spamgourmet.org",
  "spamhereplease.com",
  "spamherelots.com",
  "gmai.com",     // misspelling trap
  "gnail.com",    // misspelling trap
  "gmial.com",    // misspelling trap
  "hotmai.com",   // misspelling trap
  "hotnail.com",  // misspelling trap
]);

// ─────────────────────────────────────────────────────────────────────────────
// Exported helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Extract the domain part of an email (lowercased). */
export function getEmailDomain(email: string): string {
  const parts = email.trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

/**
 * Returns true if the email's domain is in the blacklist.
 * Also console.logs the block event with a structured tag so it's easy to
 * filter in DevTools / external log aggregators.
 */
export function isBlacklistedDomain(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return false;

  const blocked = BLACKLISTED_DOMAINS.has(domain);

  if (blocked) {
    console.warn(
      `%c[SmartRecoveryGate] DOMAIN_BLOCKED — email="${email}" domain="${domain}"`,
      "color: #f97316; font-weight: bold;"
    );
  }

  return blocked;
}

/** Human-readable tag used in console logs for Firebase error codes. */
export function logFirebaseAuthEvent(
  event: "PROVIDER_CHECK" | "RESET_SENT" | "AUTH_ERROR" | "DOMAIN_BLOCKED",
  payload: Record<string, string>
): void {
  const tag = `[SmartRecoveryGate] ${event}`;
  const style =
    event === "AUTH_ERROR" || event === "DOMAIN_BLOCKED"
      ? "color: #f87171; font-weight: bold;"
      : "color: #10b981; font-weight: bold;";

  console.log(`%c${tag}`, style, payload);
}
