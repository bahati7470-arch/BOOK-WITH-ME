// frontend/js/chat.js

const Chat = {
  el: null,
  busy: false,

  init() {
    this.el = document.getElementById("chat");
    if (!this.el) {
      console.warn("Chat: #chat element not found");
      return;
    }

    const composer = document.getElementById("composer");
    if (composer) {
      composer.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("input");
        const text = input.value.trim();
        if (!text || this.busy) return;
        input.value = "";
        this.send(text);
      });
    }

    // Event delegation: "Book" buttons and "Pay" button
    this.el.addEventListener("click", async (e) => {
      const btn = e.target.closest(".btn-book");
      if (btn) {
        const hotel = State.findHotel(btn.dataset.id);
        if (hotel) await this.handleBook(hotel);
      }

      if (e.target.id === "pay-btn") {
        const phone = document.getElementById("phone")?.value.trim();
        if (!phone) return;
        e.target.disabled = true;
        e.target.textContent = "Sending…";
        Mpesa.start(State.pendingBooking.booking_id, phone);
      }
    });
  },

  append(html) {
    if (!this.el) return;
    this.el.insertAdjacentHTML("beforeend", html);
    this.scroll();
  },

  scroll() {
    if (!this.el) return;
    this.el.scrollTop = this.el.scrollHeight;
  },

  setBusy(v) {
    this.busy = v;
    const send = document.getElementById("send");
    if (send) send.disabled = v;
  },

  async send(text) {
    State.pushMessage({ role: "user", content: text });
    this.append(Render.userBubble(text));
    this.append(Render.typing());
    this.setBusy(true);

    try {
      const res = await API.chat(text);
      document.getElementById("typing")?.remove();

      State.pushMessage({
        role: "agent",
        content: res.reply,
        hotels: res.hotels || null,
      });

      this.append(Render.agentBubble(escapeHtml(res.reply)));
      if (res.hotels?.length) this.append(Render.hotelGrid(res.hotels));
    } catch (err) {
      console.error("Chat.send failed:", err);
      document.getElementById("typing")?.remove();
      this.append(Render.agentBubble("Something went wrong. Try again?"));
    } finally {
      this.setBusy(false);
    }
  },

  async handleBook(hotel) {
    if (this.busy) return;
    this.setBusy(true);
    this.append(Render.typing());

    try {
      const booking = await API.book({
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        checkin: hotel.checkin,
        checkout: hotel.checkout,
        nights: hotel.nights ?? 3,
        amount: hotel.total_price ?? hotel.price_per_night ?? hotel.price,
        currency: "USD",
      });
      document.getElementById("typing")?.remove();
      State.pendingBooking = booking;
      this.append(Render.bookingSummary(booking));
    } catch (err) {
      console.error("Chat.handleBook failed:", err);
      document.getElementById("typing")?.remove();
      this.append(Render.agentBubble("Couldn't create the booking. Try again?"));
    } finally {
      this.setBusy(false);
    }
  },
};