const Mpesa = {
  async start(bookingId, phone) {
    try {
      const { checkout_id } = await API.pay(bookingId, phone);
      Chat.append(Render.paymentStatus("pending"));
      this.poll(checkout_id);
    } catch (err) {
      console.error("Mpesa.start failed:", err);
      Chat.append(Render.paymentStatus("failed"));
    }
  },

  poll(checkoutId) {
    const start = Date.now();
    const tick = async () => {
      if (Date.now() - start > CONFIG.POLL_TIMEOUT_MS) {
        this.replacePending("failed");
        return;
      }
      try {
        const { status } = await API.payStatus(checkoutId);
        if (status === "paid" || status === "failed") {
          this.replacePending(status);
          return;
        }
      } catch (_) {}
      setTimeout(tick, CONFIG.POLL_INTERVAL_MS);
    };
    tick();
  },

  replacePending(status) {
    const pending = document.querySelector('[data-status="pending"]');
    if (pending) {
      pending.outerHTML = Render.paymentStatus(status);
    } else {
      Chat.append(Render.paymentStatus(status));
    }
  },
};