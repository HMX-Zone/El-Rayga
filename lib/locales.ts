export const LOCALES = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "ru", name: "Русский", dir: "ltr" },
  { code: "de", name: "Deutsch", dir: "ltr" },
  { code: "fr", name: "Français", dir: "ltr" },
  { code: "it", name: "Italiano", dir: "ltr" },
  { code: "es", name: "Español", dir: "ltr" },
  { code: "pl", name: "Polski", dir: "ltr" },
  { code: "zh", name: "中文", dir: "ltr" },
  { code: "he", name: "עברית", dir: "rtl" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const LOCALE_CODES = LOCALES.map((l) => l.code);
export const RTL_LOCALES: Locale[] = ["ar", "he"];
export const dirFor = (locale: string) =>
  RTL_LOCALES.includes(locale as Locale) ? "rtl" : "ltr";
