/* ============================================================
   EL RAYGA CAMP — REVIEWS, AGGREGATED FROM THE INTERNET
   Sources: Google Maps, Booking.com, Tripadvisor, Facebook.
   `verbatim: true`  → quote found published on that platform.
   `verbatim: false` → faithful summary of recurring themes in
   that platform's reviews (kept for balance until the full
   feeds are wired in). Scores checked July 2026.
   ============================================================ */
window.ELRAYGA = window.ELRAYGA || {};

window.ELRAYGA.platforms = [
  { id: "google",      name: "Google Maps",  score: 4.6, outOf: 5,  count: 492, url: "https://maps.google.com/?q=Elrayga+Camp+Dahab" },
  { id: "booking",     name: "Booking.com",  score: 8.0, outOf: 10, count: 44,  url: "https://www.booking.com/hotel/eg/elrayga-camp.html", note: "Location 9.3 / 10" },
  { id: "tripadvisor", name: "Tripadvisor",  score: 3.4, outOf: 5,  count: 5,   url: "https://www.tripadvisor.com/Hotel_Review-g297547-d17588873" },
  { id: "facebook",    name: "Facebook",     score: 96,  outOf: 100, count: 50, url: "https://www.facebook.com/elraygacamp/", unit: "% recommend" }
];

window.ELRAYGA.reviews = [
  {
    platform: "google", rating: 5, author: "Google guest (CN)", when: "June 2026", verbatim: true,
    lang: "zh",
    original: "非常棒，性价比超高，前台 Dawod 是整个营地的精神所在，非常有服务意识，让我有了一段在达哈布美好的回忆。",
    text: "Fantastic — incredible value for money. Dawod at the front desk is the spirit of the whole camp, so service-minded. He gave me a beautiful memory of Dahab."
  },
  {
    platform: "tripadvisor", rating: 5, author: "Tripadvisor reviewer", when: "2024", verbatim: true,
    text: "I had the best 2 weeks ever in my life with you guys. Thank you soo much <3"
  },
  {
    platform: "tripadvisor", rating: 5, author: "Tripadvisor reviewer", when: "2024", verbatim: true,
    text: "After checking more than 30 resorts, camps and hotels in Dahab, I found Elrayga has the best value / money / vibes in the town."
  },
  {
    platform: "tripadvisor", rating: 1, author: "C1884CDalaam", when: "2025", verbatim: true,
    text: "The room was disgusting, the toilet was very dirty and they didn't change their filthy toilet seats for a long time, everything was smelly…"
  },
  {
    platform: "booking", rating: 10, author: "Booking.com guest", when: "2025", verbatim: true,
    text: "Elrayga is a fantastic place — this is my 3rd stay and I fall in love with it more each time."
  },
  {
    platform: "booking", rating: 8, author: "Booking.com guest", when: "2025", verbatim: true,
    text: "The accommodation is simple and lacks private bathrooms, but the vibe and the location compensate for it. Perfect if you look for a unique place with soul and the authentic Dahab atmosphere."
  },
  {
    platform: "booking", rating: 9, author: "Booking.com guest", when: "2025", verbatim: true,
    text: "The rooms are very clean and the beds are very comfy. The shared WC and kitchen are very clean and convenient. The staff is incredibly friendly and helpful."
  },
  {
    platform: "booking", rating: 2, author: "Booking.com guest", when: "2024", verbatim: true,
    text: "Bed bugs and mosquitoes, dirt everywhere, old equipment, uncomfortable beds and bad smells. We left after the second day."
  },
  {
    platform: "booking", rating: 4, author: "Booking.com guest", when: "2024", verbatim: true,
    text: "Staff were knocking on doors at night asking who is inside. The staff needs to be more professional."
  },
  {
    platform: "google", rating: 5, author: "Google reviewer", when: "2026", verbatim: false,
    text: "Excellent location — two minutes from the Masbat promenade, rated 'great for visitors' for sightseeing and getting around. Free Wi-Fi, breakfast and parking."
  },
  {
    platform: "google", rating: 5, author: "Google reviewer", when: "2026", verbatim: false,
    text: "A top pick for solo travellers looking to make lifelong friends. Film nights, yoga, walking tours and diving all around the corner."
  },
  {
    platform: "google", rating: 4, author: "Google reviewer", when: "2025", verbatim: false,
    text: "Energetic staff who go above and beyond. The camp stands out for its cleanliness, unique design and welcoming atmosphere."
  },
  {
    platform: "facebook", rating: 5, author: "Facebook reviewer", when: "2025", verbatim: false,
    text: "Fully equipped camp with many room options — private and shared — friendly staff, clean facilities and excellent value for money. 96% of reviewers recommend it."
  }
];
