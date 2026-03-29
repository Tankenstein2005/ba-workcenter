function normalizeApiUrl(value) {
  if (!value) {
    return "";
  }

  return value.trim().replace(/\/+$/, "");
}

const configuredApiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);
const API_URL = configuredApiUrl || (import.meta.env.DEV ? "https://ba-api.vercel.app" : "/api");

function normalizePublicLink(publicLink) {
  if (!publicLink || /^https?:\/\//i.test(publicLink)) {
    return publicLink;
  }

  if (typeof window === "undefined") {
    return publicLink;
  }

  return new URL(publicLink, window.location.origin).toString();
}

function normalizeApiResponse(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeApiResponse);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const normalized = Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      key === "publicLink"
        ? normalizePublicLink(entryValue)
        : normalizeApiResponse(entryValue),
    ]),
  );

  return normalized;
}

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error(
      "API is not configured. Set VITE_API_URL in the frontend deployment environment.",
    );
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error(
      "Could not reach the API. Check that VITE_API_URL points to your deployed backend and that CORS allows this site.",
    );
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed." }));
    throw new Error(error.message || "Request failed.");
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  return normalizeApiResponse(data);
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
