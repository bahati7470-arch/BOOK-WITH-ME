const Render = {
  agentBubble(html) {
    return `<div class="msg agent"><div class="bubble">${html}</div></div>`;
  },

  userBubble(text) {
    return `<div class="msg user"><div class="bubble">${escapeHtml(text)}</div></div>`;
  },

  typing() {
    return `<div class="msg agent typing" id="typing">
      <div class="bubble"><span></span><span></span><span></span></div>
    </div>`;
  },

  hotelCard(h) {
    return `
      <article class="hotel-card" data-id="${h.id}">
        <div class="hotel-thumb-wrap">
          ${
            h.image
              ? `<img class="hotel-thumb" src="${h.image}" alt="${escapeHtml(h.name)}" loading="lazy" />`
              : `<div class="hotel-thumb placeholder">${escapeHtml(h.name)}</div>`
          }
          <button class="heart" aria-label="Save" data-heart="${h.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <span class="price-badge"><span class="star">★</span> $${h.price_per_night}</span>
        </div>
        <div class="hotel-body">
          <h4>${escapeHtml(h.name)}</h4>
          <p class="hotel-loc">${escapeHtml(h.location)}</p>
          <div class="hotel-rating">
            ${"★".repeat(Math.round(h.rating))}${"☆".repeat(5 - Math.round(h.rating))}
            <span class="count">${h.rating}</span>
          </div>
          <div class="hotel-foot">
            <div class="hotel-price">$${h.price_per_night}<span>/night</span></div>
            <button class="btn-book" data-id="${h.id}">Book</button>
          </div>
        </div>
      </article>
    `;
  },

  hotelGrid(hotels) {
    return `<div class="msg agent"><div class="hotel-grid">${hotels.map((h) => this.hotelCard(h)).join("")}</div></div>`;
  },

  bookingSummary(booking) {
    return `<div class="msg agent">
      <div class="booking-card">
        <h4>${escapeHtml(booking.hotel_name)}</h4>
        <div class="booking-row"><span>Check-in</span><strong>${booking.checkin}</strong></div>
        <div class="booking-row"><span>Check-out</span><strong>${booking.checkout}</strong></div>
        <div class="booking-row"><span>Nights</span><strong>${booking.nights}</strong></div>
        <div class="booking-row"><span>Total</span><strong>$${booking.amount} ${booking.currency}</strong></div>
        <div class="phone-row">
          <input id="phone" type="tel" placeholder="M-Pesa phone e.g. 2547XXXXXXXX" />
          <button id="pay-btn" class="btn-primary">Pay</button>
        </div>
      </div>
    </div>`;
  },

  paymentStatus(status) {
    const wrap = (inner) =>
      `<div class="msg agent" data-status="${status}"><div class="status ${status}">${inner}</div></div>`;
    if (status === "pending") return wrap(`<span class="spinner"></span> Check your phone for the M-Pesa prompt…`);
    if (status === "paid") return wrap(`✅ Payment confirmed. You're booked!`);
    return wrap(`❌ Payment failed or cancelled.`);
  },
};

function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}