// ─────────────────────────────────────────────────────────────
// Entrypoint: boots the chat, wires the drawer, renders
// the featured grid, and handles the hero search form.
// ─────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  Chat.init();
  wireDrawer();
  wireSearch();
  loadFeatured();
  wireNav();
  loadFeatured();
});
// ── Chat drawer open/close ─────────────────────────────────
function wireDrawer() {
  const drawer = document.getElementById("chat-drawer");
  const fab = document.getElementById("chat-fab");
  const close = document.getElementById("chat-close");

  const open = () => {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  };

  const shut = () => {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  };

  fab?.addEventListener("click", open);
  close?.addEventListener("click", shut);

  // Expose for other modules (Chat.handleBook uses it)
  window.openChatDrawer = open;
}

// ── Hero search → chat ─────────────────────────────────────
function wireSearch() {
  const form = document.getElementById("search-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const loc = document.getElementById("location").value.trim();
    const dates = document.getElementById("dates").value.trim();
    const guests = document.getElementById("guests").value.trim();

    const parts = [`Hotel in ${loc || "Kenya"}`];
    if (dates) parts.push(`for ${dates}`);
    if (guests) parts.push(`for ${guests}`);

    window.openChatDrawer?.();
    Chat.send(parts.join(" "));
  });
}

// ── Nav filter (Home / Safari Lodges / Beach Resorts / My Bookings) ─

function wireNav(){
  const links = document.querySelectorAll(".nav-links a");
  if (!links.length) return;
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const label = link.textContent.trim().toLowerCase();

      if (label.includes("safari")) {
        loadFeatured("safari");
      } else if (label.includes("beach")) {
        loadFeatured("beach");
      } else if (label.includes("booking")) {
        showMyBookings();
      } else {
        loadFeatured("all");
      }
    });
  });
}

// ── Featured hotel grid ────────────────────────────────────
async function loadFeatured(filter = "all") {
  const grid = document.getElementById("card-grid");
  if (!grid) return;

  try {
    let hotels = await API.featured();

    if (filter === "safari") {
      hotels = hotels.filter((h) =>
        /mara|safari|lodge/i.test(`${h.name} ${h.location || ""}`)
      );
    } else if (filter === "beach") {
      hotels = hotels.filter((h) =>
        /diani|beach|coast|ukunda/i.test(`${h.name} ${h.location || ""}`)
      );
    }

    if (!hotels.length) {
      grid.innerHTML = `<p style="padding:24px;color:var(--muted)">
        No hotels match that category yet.
      </p>`;
      return;
    }

    grid.innerHTML = hotels.map((h) => Render.hotelCard(h)).join("");
    // Event delegation: heart toggle + book button
    grid.addEventListener("click", (e) => {
      const heart = e.target.closest("[data-heart]");
      if (heart) {
        heart.classList.toggle("active");
        return;
      }

      const btn = e.target.closest(".btn-book");
      if (btn) {
        const hotel = hotels.find((h) => String(h.id) === btn.dataset.id);
        if (!hotel) return;
        window.openChatDrawer?.();
        Chat.handleBook(hotel);
      }
    });
  } catch (err) {
    console.error("Failed to load featured hotels:", err);
    grid.innerHTML =
      '<p style="color:var(--muted);padding:0 24px">Could not load hotels.</p>';
  }
}

// ── My Bookings view ───────────────────────────────────────
function showMyBookings() {
  const grid = document.getElementById("card-grid");
  if (!grid) return;

  const bookings = JSON.parse(localStorage.getItem("bwm_bookings") || "[]");

  if (!bookings.length) {
    grid.innerHTML = `
      <p style="padding:24px;color:var(--muted);grid-column:1/-1">
        No bookings yet. Chat with the concierge to book your first stay.
      </p>`;
    return;
  }

  grid.innerHTML = bookings
    .map(
      (b) => `
      <article class="hotel-card">
        <div class="hotel-thumb-wrap">
          <div class="hotel-thumb placeholder">${escapeHtml(b.hotel_name)}</div>
        </div>
        <div class="hotel-body">
          <h4>${escapeHtml(b.hotel_name)}</h4>
          <p class="hotel-loc">${b.checkin} → ${b.checkout} · ${b.nights} nights</p>
          <div class="hotel-foot">
            <div class="hotel-price">$${b.amount}<span>${b.currency}</span></div>
            <span class="price-badge" style="position:static">${b.status}</span>
          </div>
        </div>
      </article>`
    )
    .join("");
}