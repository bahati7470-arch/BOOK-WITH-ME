const State = {
  sessionId: localStorage.getItem("bwm_session") || crypto.randomUUID(),
  history: [],
  prefs: JSON.parse(localStorage.getItem("bwm_prefs") || "{}"),
  pendingBooking: null,

  save() {
    localStorage.setItem("bwm_session", this.sessionId);
    localStorage.setItem("bwm_prefs", JSON.stringify(this.prefs));
  },

  pushMessage(msg) {
    this.history.push(msg);
    if (this.history.length > 40) this.history.shift();
  },

  findHotel(id) {
    for (const msg of this.history) {
      if (msg.hotels) {
        const found = msg.hotels.find((h) => String(h.id) === String(id));
        if (found) return found;
      }
    }
    return null;
  },
};

State.save();