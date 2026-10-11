const API = {
  async chat(message) {
    if (CONFIG.USE_MOCK) return Mock.chat(message);

    const res = await fetch(`${CONFIG.API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: State.sessionId,
        message,
        history: State.history.slice(-10),
        prefs: State.prefs,
      }),
    });
    if (!res.ok) throw new Error(`chat ${res.status}`);
    return res.json();
  },

  async featured() {
  if (CONFIG.USE_MOCK) return Mock.featured();

  const res = await fetch(`${CONFIG.API_BASE}/hotels/featured`);
  if (!res.ok) throw new Error(`featured ${res.status}`);
  return res.json();
},
  async book(draft) {
    if (CONFIG.USE_MOCK) return Mock.book(draft);

    const res = await fetch(`${CONFIG.API_BASE}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, session_id: State.sessionId }),
    });
    if (!res.ok) throw new Error(`book ${res.status}`);
    return res.json();
  },

  async pay(bookingId, phone) {
    if (CONFIG.USE_MOCK) return Mock.pay(bookingId, phone);

    const res = await fetch(`${CONFIG.API_BASE}/payments/mpesa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId, phone }),
    });
    if (!res.ok) throw new Error(`pay ${res.status}`);
    return res.json();
  },

  async payStatus(checkoutId) {
    if (CONFIG.USE_MOCK) return Mock.payStatus(checkoutId);

    const res = await fetch(`${CONFIG.API_BASE}/payments/mpesa/${checkoutId}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    return res.json();
  },

  async featured() {
    if (CONFIG.USE_MOCK) return Mock.featured();

    const res = await fetch(`${CONFIG.API_BASE}/hotels/featured`);
    if (!res.ok) throw new Error(`featured ${res.status}`);
    return res.json();
  },
};