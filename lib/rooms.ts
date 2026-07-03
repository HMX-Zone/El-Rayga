/* Static, non-translatable room metadata. Translatable copy lives in
   messages/<locale>.json under `rooms.<slug>` and `features.*`. */

export const ROOM_ORDER = [
  "seafront-bamboo-hut",
  "garden-hut",
  "bedouin-hut",
  "comfy-studio",
  "private-double",
  "family-lodge",
  "mixed-dorm",
  "female-dorm",
] as const;

export type RoomSlug = (typeof ROOM_ORDER)[number];

/** feature keys per room → translated via `features.<key>` */
export const ROOM_FEATURES: Record<RoomSlug, string[]> = {
  "seafront-bamboo-hut": ["seaViewPatio", "fanNet", "wifi", "sockets", "linen", "hammocks", "sharedKitchen", "breakfast"],
  "garden-hut": ["gardenView", "fanNet", "wifi", "readingLight", "linen", "sharedKitchen", "bbq", "luggage"],
  "bedouin-hut": ["courtyardView", "fanNet", "wifi", "rugs", "linen", "sharedKitchen", "firePit", "soloFavourite"],
  "comfy-studio": ["ac", "privateBath", "kitchenette", "microwave", "desk", "fastWifi", "weeklyHousekeeping", "longStay"],
  "private-double": ["ac", "privateBath", "blackout", "wifi", "dailyHousekeeping", "toiletries", "courtyardAccess", "breakfast"],
  "family-lodge": ["ac", "privateBath", "sleepsFour", "patioNook", "wifi", "familyFriendly", "dailyHousekeeping", "cot"],
  "mixed-dorm": ["ac", "locker", "socketLight", "wifi", "linenIncluded", "sharedKitchen", "luggage", "backpackerFavourite"],
  "female-dorm": ["womenOnly", "ac", "privacyCurtains", "locker", "socketLight", "wifi", "linenIncluded", "mirrorCorner"],
};

export const ARABIC_NAMES: Record<RoomSlug, string> = {
  "seafront-bamboo-hut": "عشة البحر",
  "garden-hut": "عشة الجنينة",
  "bedouin-hut": "عشة بدوية",
  "comfy-studio": "ستوديو",
  "private-double": "غرفة خاصة",
  "family-lodge": "بيت العيلة",
  "mixed-dorm": "عنبر مشترك",
  "female-dorm": "عنبر بنات",
};

export const CAMP = {
  name: "El Rayga Camp",
  arabic: "كامب الرايجه",
  address: "Peace Rd, Masbat, Dahab, South Sinai 46617, Egypt",
  plusCode: "FGX8+7C Dahab",
  phone: "+20 103 006 9058",
  phoneRaw: "201030069058",
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
  currency: "EGP",
} as const;

export const PLATFORMS = [
  { id: "google", name: "Google Maps", score: 4.6, outOf: 5, count: 492, url: "https://maps.google.com/?q=Elrayga+Camp+Dahab" },
  { id: "booking", name: "Booking.com", score: 8.0, outOf: 10, count: 44, url: "https://www.booking.com/hotel/eg/elrayga-camp.html", note: "9.3 / 10" },
  { id: "tripadvisor", name: "Tripadvisor", score: 3.4, outOf: 5, count: 5, url: "https://www.tripadvisor.com/Hotel_Review-g297547-d17588873" },
  { id: "facebook", name: "Facebook", score: 96, outOf: 100, count: 50, url: "https://www.facebook.com/elraygacamp/", unit: "%" },
] as const;

export const fmtEGP = (n: number, locale = "en") =>
  new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale).format(n);
