// Active installations of the anti-spam plugin, fetched from the WordPress.org plugin API once per
// build (the site is static, so the number is as fresh as the last build/deploy).
// WordPress.org reports installs in buckets (5000 means "5,000+"), so the texts say "+" / "more than".
// If the request fails (offline, timeout, API change), FALLBACK is used and the build goes on.
const SLUG = 'gdpr-compliant-recaptcha-for-all-forms';
const API = `https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${SLUG}&request[fields][active_installs]=1`;
// Last value checked by hand (2026-11-17). Raise it when the live number has grown for good.
const FALLBACK = 5000;

async function fetchInstalls(): Promise<number> {
  try {
    const res = await fetch(API, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const n = (await res.json()).active_installs;
    if (!Number.isInteger(n) || n <= 0) throw new Error(`unexpected active_installs: ${n}`);
    return n;
  } catch (e) {
    console.warn(`[wporg] active installs not fetched (${(e as Error).message}), using fallback ${FALLBACK}`);
    return FALLBACK;
  }
}

export const WP_INSTALLS = await fetchInstalls();
/** "5,000" */
export const WP_INSTALLS_TEXT = WP_INSTALLS.toLocaleString('en-US');

/** Replaces `{installs}` in a text (used in project frontmatter, which can't import code). */
export function withInstalls(text: string) {
  return text.replaceAll('{installs}', WP_INSTALLS_TEXT);
}
