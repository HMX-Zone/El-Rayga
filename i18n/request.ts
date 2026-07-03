import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/* Non-English locales are deep-merged over English so long-form copy
   (room descriptions etc.) falls back gracefully while all UI strings
   stay translated. Adding a language = adding one messages/<code>.json. */
function deepMerge<T extends Record<string, unknown>>(base: T, over: Partial<T>): T {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof out[k] === "object" && out[k] !== null) {
      out[k] = deepMerge(out[k] as Record<string, unknown>, v as Record<string, unknown>);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const base = (await import(`../messages/en.json`)).default;
  const messages =
    locale === "en" ? base : deepMerge(base, (await import(`../messages/${locale}.json`)).default);

  return { locale, messages };
});
