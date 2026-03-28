const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed." }));
    throw new Error(error.message || "Request failed.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  listEventTypes: () => request("/event-types"),
  getEventType: (id) => request(`/event-types/${id}`),
  createEventType: (payload) =>
    request("/event-types", { method: "POST", body: JSON.stringify(payload) }),
  updateEventType: (id, payload) =>
    request(`/event-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteEventType: (id) => request(`/event-types/${id}`, { method: "DELETE" }),
  listBookings: () => request("/bookings"),
  getBooking: (reference) => request(`/bookings/${reference}`),
  cancelBooking: (reference, reason) =>
    request(`/bookings/${reference}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  rescheduleBooking: (reference, payload) =>
    request(`/bookings/${reference}/reschedule`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getPublicEvent: (slug) => request(`/public/${slug}`),
  getPublicSlots: (slug, date) => request(`/public/${slug}/slots?date=${date}`),
  createPublicBooking: (slug, payload) =>
    request(`/public/${slug}/book`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
