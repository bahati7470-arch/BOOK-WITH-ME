// ─────────────────────────────────────────────────────────────
// Mock data + fake backend responses.
// Swap this out once FastAPI is live (set USE_MOCK=false).
// ─────────────────────────────────────────────────────────────

const MOCK_HOTELS = [
  {
    id: 1,
    name: "JW Marriott Masai Mara",
    location: "Masai Mara, Kenya",
    price: 75,
    rating: 5,
    stars: "⭐⭐⭐⭐⭐",
    image: "assets/images/hotel-1.jpg",
    checkin: "2026-11-01",
    checkout: "2026-11-04",
    nights: 3,
  },
  {
    id: 2,
    name: "Premium Luxury Suite",
    location: "Nairobi, Kenya",
    price: 15,
    rating: 5,
    stars: "⭐⭐⭐⭐⭐",
    image: "assets/images/hotel-2.jpg",
    checkin: "2026-11-01",
    checkout: "2026-11-04",
    nights: 3,
  },
  {
    id: 3,
    name: "Mara Evening Lounge Deck",
    location: "Diani Beach, Kenya",
    price: 13,
    rating: 4,
    stars: "⭐⭐⭐⭐☆",
    image: "assets/images/hotel-3.jpg",
    checkin: "2026-11-01",
    checkout: "2026-11-04",
    nights: 3,
  },
  {
    id: 4,
    name: "Baobab Beach Resort",
    location: "Diani Beach, Kenya",
    price: 78,
    rating: 5,
    stars: "⭐⭐⭐⭐⭐",
    image: "assets/images/hotel-4.jpg",
    checkin: "2026-11-01",
    checkout: "2026-11-04",
    nights: 3,
  },
  {id: 5,
    name:  "Giraffe Manor",
    location: "Nairobi, Kenya",
    price: 95,
    rating: 5,
    stars: "⭐⭐⭐⭐⭐",
    image: "assets/images/hotel-5.jpg",
    checkin: "2026-11-01",
    checkout: "2026-11-04",
    nights: 3,
  },
  {
    id: 6,
    name: "Angama Mara",
    location: "Masai Mara, Kenya",
    price: 88,
    rating: 5,
    stars: "⭐⭐⭐⭐⭐",
    image: "assets/images/hotel-1.jpg",
    checkin: "2026-11-01",
    checkout: "2026-11-04",
    nights: 3,
  },
];

const MOCK_DIANI = [
  {
    id: "h1",
    name: "Diani Sea Lodge",
    location: "Diani Beach",
    rating: 4.5,
    price_per_night: 72,
    total_price: 216,
    checkin: "2026-11-01",
    checkout: "2026-11-04",
    nights: 3,
    image: "assets/images/hotel-3.jpg",
  },
  {
    id: "h2",
    name: "Baobab Beach Resort",
    location: "Diani Beach",
    rating: 4.7,
    price_per_night: 78,
    total_price: 234,
    checkin: "2026-11-01",
    checkout: "2026-11-04",
    nights: 3,
    image: "assets/images/hotel-4.jpg",
  },
  {
    id: "h3",
    name: "Pinewood Village",
    location: "Ukunda",
    rating: 4.2,
    price_per_night: 65,
    total_price: 195,
    checkin: "2026-11-01",
    checkout: "2026-11-04",
    nights: 3,
    image: "assets/images/hotel-5.jpg",
  },
];

const Mock = {
  _payments: {},

  // ── Landing page featured grid ─────────────────────────────
  async featured() {
    await sleep(250);
    return MOCK_HOTELS.map((h) => ({
      ...h,
      price_per_night: h.price_per_night ?? h.price,
    }));
  },

  // ── AI chat ────────────────────────────────────────────────
  async chat(message) {
    await sleep(900);
    const lower = (message || "").toLowerCase();

    if (lower.includes("diani") || lower.includes("beach")) {
      return {
        reply: "Found 3 options in Diani under $80. Which one catches your eye?",
        hotels: MOCK_DIANI,
      };
    }

    if (lower.includes("mara") || lower.includes("safari")) {
      return {
        reply: "Here are 3 safari lodges in the Masai Mara:",
        hotels: MOCK_HOTELS.map((h) => ({
          ...h,
          price_per_night: h.price,
          total_price: h.price * h.nights,
        })),
      };
    }

    if (lower.includes("hotel") || lower.includes("stay")) {
      return {
        reply: "Here are some top picks across Kenya:",
        hotels: MOCK_DIANI,
      };
    }

    return {
      reply:
        'Got it. Tell me a destination and dates, e.g. "Hotel in Diani for 3 nights under $80".',
    };
  },

  // ── Booking ────────────────────────────────────────────────
  async book(draft) {
    await sleep(600);
    return {
      booking_id: "bk_" + Math.random().toString(36).slice(2, 10),
      hotel_id: draft.hotel_id,
      hotel_name: draft.hotel_name,
      checkin: draft.checkin,
      checkout: draft.checkout,
      nights: draft.nights ?? 3,
      amount: draft.amount,
      currency: draft.currency || "USD",
    };
  },

  // ── M-Pesa ─────────────────────────────────────────────────
  async pay(bookingId, phone) {
    await sleep(500);
    const checkoutId = "co_" + Math.random().toString(36).slice(2, 10);
    this._payments[checkoutId] = { started: Date.now(), status: "pending" };
    return { checkout_id: checkoutId };
  },

  async payStatus(checkoutId) {
    const p = this._payments[checkoutId];
    if (!p) return { status: "failed" };
    // Pretend the user confirms after ~6s.
    if (Date.now() - p.started > 6000) p.status = "paid";
    return { status: p.status };
  },
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}