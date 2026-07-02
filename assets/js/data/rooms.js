/* ============================================================
   EL RAYGA CAMP — ACCOMMODATION DATA
   Edit prices / copy here. Photos live in /assets/img/rooms/<slug>/
   Drop real photos (1.jpg, 2.jpg ...) into those folders and
   update the `photos` arrays below — everything else updates
   automatically (cards, galleries, booking, checkout).
   Prices are indicative, based on public OTA listings (July 2026).
   ============================================================ */
window.ELRAYGA = window.ELRAYGA || {};

window.ELRAYGA.rooms = [
  {
    slug: "seafront-bamboo-hut",
    name: "Seafront Bamboo Hut",
    arabic: "عشة البحر",
    kind: "hut",
    tagline: "Fall asleep to the Gulf of Aqaba, wake up two steps from it.",
    description:
      "Our signature bamboo hut on the front row of the camp. Woven palm walls, a proper mattress with fresh linen, and a private patio that looks straight across the lagoon to the Saudi mountains. Simple on purpose — this is the classic Dahab camp experience the Masbat strip was built on.",
    sleeps: 2,
    beds: "1 double bed",
    bath: "Shared bathrooms (cleaned twice daily)",
    size: "12 m²",
    price: 950,
    unit: "hut / night",
    perBed: false,
    features: ["Sea view patio", "Fan + mosquito net", "Free Wi-Fi", "Power sockets", "Fresh linen & towels", "Hammock access", "Shared kitchen", "Breakfast available"],
    photos: [
      "/assets/img/rooms/seafront-bamboo-hut/1.svg",
      "/assets/img/rooms/seafront-bamboo-hut/2.svg",
      "/assets/img/rooms/seafront-bamboo-hut/3.svg",
      "/assets/img/rooms/seafront-bamboo-hut/4.svg"
    ],
    accent: "#ff5c39"
  },
  {
    slug: "garden-hut",
    name: "Garden Hut",
    arabic: "عشة الجنينة",
    kind: "hut",
    tagline: "A quiet hut wrapped in bougainvillea, off the courtyard.",
    description:
      "Tucked into the green inner courtyard, away from the promenade. Twin beds, woven bamboo, and the sound of the garden instead of the street. Shared bathrooms are a short barefoot walk away. The pick for light sleepers who still want the camp life.",
    sleeps: 2,
    beds: "2 single beds",
    bath: "Shared bathrooms (cleaned twice daily)",
    size: "11 m²",
    price: 850,
    unit: "hut / night",
    perBed: false,
    features: ["Garden view", "Fan + mosquito net", "Free Wi-Fi", "Reading light", "Fresh linen & towels", "Shared kitchen", "BBQ area access", "Luggage storage"],
    photos: [
      "/assets/img/rooms/garden-hut/1.svg",
      "/assets/img/rooms/garden-hut/2.svg",
      "/assets/img/rooms/garden-hut/3.svg",
      "/assets/img/rooms/garden-hut/4.svg"
    ],
    accent: "#3f9d6e"
  },
  {
    slug: "bedouin-hut",
    name: "Bedouin Hut — Single",
    arabic: "عشة بدوية",
    kind: "hut",
    tagline: "One bed, one lantern, one million stars.",
    description:
      "The solo traveller's hut. A single mattress on a raised palm-wood base, Bedouin rugs, a brass lantern, and just enough room for a backpack and a good book. It's the cheapest private space in the camp and the most asked-for after sunset tea at the fire pit.",
    sleeps: 1,
    beds: "1 single bed",
    bath: "Shared bathrooms (cleaned twice daily)",
    size: "8 m²",
    price: 650,
    unit: "hut / night",
    perBed: false,
    features: ["Courtyard view", "Fan + mosquito net", "Free Wi-Fi", "Bedouin rugs", "Fresh linen & towels", "Shared kitchen", "Fire-pit access", "Solo-traveller favourite"],
    photos: [
      "/assets/img/rooms/bedouin-hut/1.svg",
      "/assets/img/rooms/bedouin-hut/2.svg",
      "/assets/img/rooms/bedouin-hut/3.svg",
      "/assets/img/rooms/bedouin-hut/4.svg"
    ],
    accent: "#d8a24a"
  },
  {
    slug: "comfy-studio",
    name: "Comfy Studio",
    arabic: "ستوديو",
    kind: "room",
    tagline: "Your own kitchen, your own keys, camp on your doorstep.",
    description:
      "A proper studio for slow travellers and remote workers. Air-conditioning, a fully equipped kitchenette with fridge and microwave, a comfortable double bed and a desk that actually works for working. Stay a week, stay a season — long-stay rates on request.",
    sleeps: 2,
    beds: "1 double bed",
    bath: "Private bathroom",
    size: "22 m²",
    price: 1175,
    unit: "studio / night",
    perBed: false,
    features: ["Air conditioning", "Private bathroom", "Kitchenette + fridge", "Microwave & kettle", "Work desk", "Fast Wi-Fi", "Weekly housekeeping", "Long-stay rates"],
    photos: [
      "/assets/img/rooms/comfy-studio/1.svg",
      "/assets/img/rooms/comfy-studio/2.svg",
      "/assets/img/rooms/comfy-studio/3.svg",
      "/assets/img/rooms/comfy-studio/4.svg"
    ],
    accent: "#4d8fd1"
  },
  {
    slug: "private-double",
    name: "Private Double Room",
    arabic: "غرفة خاصة",
    kind: "room",
    tagline: "Camp soul, hotel sleep. AC, ensuite, done.",
    description:
      "A solid, spotless private room off the courtyard with air-conditioning and its own bathroom. Thick walls, blackout curtains and a real mattress — for couples and anyone who loves the camp vibe but negotiates hard on sleep quality.",
    sleeps: 2,
    beds: "1 double bed",
    bath: "Private bathroom",
    size: "18 m²",
    price: 1175,
    unit: "room / night",
    perBed: false,
    features: ["Air conditioning", "Private bathroom", "Blackout curtains", "Free Wi-Fi", "Daily housekeeping", "Towels & toiletries", "Courtyard access", "Breakfast available"],
    photos: [
      "/assets/img/rooms/private-double/1.svg",
      "/assets/img/rooms/private-double/2.svg",
      "/assets/img/rooms/private-double/3.svg",
      "/assets/img/rooms/private-double/4.svg"
    ],
    accent: "#b06ab3"
  },
  {
    slug: "family-lodge",
    name: "Family Lodge",
    arabic: "بيت العيلة",
    kind: "room",
    tagline: "Four beds, one courtyard, zero screens required.",
    description:
      "The biggest room in the camp: a double bed plus two singles, air-conditioning, ensuite bathroom and a shaded seating nook outside the door. Kids get the garden, the rabbits and the lagoon; you get Bedouin tea and an actual holiday.",
    sleeps: 4,
    beds: "1 double + 2 single beds",
    bath: "Private bathroom",
    size: "28 m²",
    price: 1850,
    unit: "lodge / night",
    perBed: false,
    features: ["Air conditioning", "Private bathroom", "Sleeps four", "Shaded patio nook", "Free Wi-Fi", "Family friendly", "Daily housekeeping", "Cot on request"],
    photos: [
      "/assets/img/rooms/family-lodge/1.svg",
      "/assets/img/rooms/family-lodge/2.svg",
      "/assets/img/rooms/family-lodge/3.svg",
      "/assets/img/rooms/family-lodge/4.svg"
    ],
    accent: "#e0723c"
  },
  {
    slug: "mixed-dorm",
    name: "Mixed Dorm — 5-Bed AC",
    arabic: "عنبر مشترك",
    kind: "dorm",
    tagline: "The backpacker classic. Cold AC, warm people.",
    description:
      "Five proper single beds — no squeaky bunk towers — in an air-conditioned shared room with personal lockers, reading lights and sockets by every bed. Shared bathrooms across the courtyard. Half of Dahab's best friendships started in this room.",
    sleeps: 5,
    beds: "5 single beds (book per bed)",
    bath: "Shared bathrooms (cleaned twice daily)",
    size: "24 m²",
    price: 350,
    unit: "bed / night",
    perBed: true,
    features: ["Air conditioning", "Personal locker", "Socket + light per bed", "Free Wi-Fi", "Linen included", "Shared kitchen", "Luggage storage", "Backpacker favourite"],
    photos: [
      "/assets/img/rooms/mixed-dorm/1.svg",
      "/assets/img/rooms/mixed-dorm/2.svg",
      "/assets/img/rooms/mixed-dorm/3.svg",
      "/assets/img/rooms/mixed-dorm/4.svg"
    ],
    accent: "#2ba7a0"
  },
  {
    slug: "female-dorm",
    name: "Female Dorm — 4-Bed AC",
    arabic: "عنبر بنات",
    kind: "dorm",
    tagline: "Women-only, four beds, extra mirrors, same sea.",
    description:
      "A women-only air-conditioned dorm with four single beds, curtained for privacy, personal lockers and a large mirror corner. Steps from the shared kitchen and the quiet end of the courtyard. Solo female travellers rate this — and Dahab — very highly.",
    sleeps: 4,
    beds: "4 single beds (book per bed)",
    bath: "Shared bathrooms (cleaned twice daily)",
    size: "20 m²",
    price: 400,
    unit: "bed / night",
    perBed: true,
    features: ["Women only", "Air conditioning", "Privacy curtains", "Personal locker", "Socket + light per bed", "Free Wi-Fi", "Linen included", "Mirror corner"],
    photos: [
      "/assets/img/rooms/female-dorm/1.svg",
      "/assets/img/rooms/female-dorm/2.svg",
      "/assets/img/rooms/female-dorm/3.svg",
      "/assets/img/rooms/female-dorm/4.svg"
    ],
    accent: "#e2557b"
  }
];

window.ELRAYGA.camp = {
  name: "El Rayga Camp",
  arabic: "كامب الرايجه",
  address: "Peace Rd, Masbat, Dahab, South Sinai 46617, Egypt",
  plusCode: "FGX8+7C Dahab",
  phone: "+20 103 006 9058",
  phoneRaw: "201030069058",
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
  currency: "EGP"
};
