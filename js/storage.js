/* ────────────────────────────────────────────────────────────────────────
 * storage.js — URL state codec for the kinematics calculator.
 *
 * Encodes which tab is active + the inputs on that tab into URL query
 * params, and decodes a URL back into the same structure for page-load
 * hydration.
 *
 * URL formats:
 *   ?tab=1d&u=0&v=10&a=2          → 1D, three SUVAT vars provided
 *   ?tab=2d&ux=10&uy=5&ax=0&ay=-9.8&t=2
 *   ?tab=proj&v0=20&theta=45&g=9.8
 *
 * No localStorage (v2 has no "save and load" feature — the URL IS the
 * shareable artifact).
 * ──────────────────────────────────────────────────────────────────────── */

const TAB_FIELDS = {
  '1d':   ['u', 'v', 'a', 's', 't'],
  '2d':   ['ux', 'uy', 'ax', 'ay', 't'],
  'proj': ['v0', 'theta', 'g'],
};

const VALID_TABS = new Set(Object.keys(TAB_FIELDS));

/**
 * Encode tab + inputs as a URL query string (without leading "?").
 * Returns "" if there's nothing meaningful to encode.
 *
 * @param {{ tab: '1d'|'2d'|'proj', inputs: Record<string, string|number> }} state
 */
export function encodeState({ tab, inputs } = {}) {
  if (!VALID_TABS.has(tab)) return '';

  const params = new URLSearchParams();
  params.set('tab', tab);

  const allowed = TAB_FIELDS[tab];
  let hasAny = false;
  for (const key of allowed) {
    const value = inputs && inputs[key];
    if (value === undefined || value === null || value === '') continue;
    // Only encode finite numeric values
    const num = parseFloat(value);
    if (!Number.isFinite(num)) continue;
    params.set(key, String(value).trim());
    hasAny = true;
  }

  // If no actual input values were given, the URL is just the tab —
  // still useful (deep-link to a tab). Return it.
  return params.toString();
}

/**
 * Decode a URL query string into { tab, inputs }. Accepts strings with or
 * without leading "?". Returns null if no valid `tab` param is present.
 *
 * @param {string} searchString
 */
export function decodeState(searchString) {
  const cleaned = searchString && searchString.startsWith('?')
    ? searchString.slice(1)
    : (searchString || '');
  const params = new URLSearchParams(cleaned);
  const tab = params.get('tab');
  if (!tab || !VALID_TABS.has(tab)) return null;

  const allowed = TAB_FIELDS[tab];
  const inputs = {};
  for (const key of allowed) {
    const value = params.get(key);
    if (value === null || value === '') continue;
    const num = parseFloat(value);
    if (!Number.isFinite(num)) continue;
    inputs[key] = value.trim();
  }

  return { tab, inputs };
}

/**
 * Build a full shareable URL from current page origin + path + encoded
 * state. Drops any existing hash/query. If `state` produces no params,
 * returns the bare origin+path.
 */
export function buildShareUrl(state) {
  const query = encodeState(state);
  const { origin, pathname } = window.location;
  return query ? `${origin}${pathname}?${query}` : `${origin}${pathname}`;
}
