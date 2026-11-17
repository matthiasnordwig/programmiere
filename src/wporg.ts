// Active installations of the anti-spam plugin, fetched from the WordPress.org plugin API once per
// build. This build value stays in the HTML as fallback; components/Installs.astro replaces it in the
// browser with /data/wporg-installs.json, which a daily job on the server writes
// (scripts/wporg-installs.sh) — same origin, the visitor's browser never asks WordPress.org.
// WordPress.org reports installs in buckets (5000 means "5,000+"), so the texts say "+" / "more than".
// If the request fails (offline, timeout, API change), FALLBACK is used and the build goes on.
const SLUG = 'gdpr-compliant-recaptcha-for-all-forms';
const API = `https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${SLUG}&request[fields][active_installs]=1`;
// Last value checked by hand, with its date. Raise both when the live number has grown for good.
const FALLBACK = 5000;
const FALLBACK_CHECKED = '2026-11-17T00:00:00Z';

async function fetchInstalls(): Promise<{ n: number; at: string }> {
  try {
    const res = await fetch(API, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const n = (await res.json()).active_installs;
    if (!Number.isInteger(n) || n <= 0) throw new Error(`unexpected active_installs: ${n}`);
    return { n, at: new Date().toISOString() };
  } catch (e) {
    console.warn(`[wporg] active installs not fetched (${(e as Error).message}), using fallback ${FALLBACK}`);
    return { n: FALLBACK, at: FALLBACK_CHECKED };
  }
}

const fetched = await fetchInstalls();
export const WP_INSTALLS = fetched.n;
/** When WP_INSTALLS was fetched (ISO). The browser only takes the server file if it is newer. */
export const WP_INSTALLS_AT = fetched.at;
/** "5,000" */
export const WP_INSTALLS_TEXT = WP_INSTALLS.toLocaleString('en-US');
