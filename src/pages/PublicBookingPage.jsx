import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { nextSevenDays } from "../utils/dates.js";

export default function PublicBookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    nextSevenDays()[0].format("YYYY-MM-DD"),
  );
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [form, setForm] = useState({ name: "", email: "", answers: {} });
  const [pageLoading, setPageLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setPageLoading(true);
    setLoadError("");
    api
      .getPublicEvent(slug)
      .then((result) => {
        if (!active) return;
        setPage(result);
      })
      .catch((err) => {
        if (!active) return;
        setPage(null);
        setLoadError(err.message);
      })
      .finally(() => {
        if (active) {
          setPageLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    let active = true;
    setSlots([]);
    setSelectedSlot("");
    setSlotsLoading(true);
    setLoadError("");
    api
      .getPublicSlots(slug, selectedDate)
      .then((data) => {
        if (!active) return;
        setSlots(data.slots);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err.message);
      })
      .finally(() => {
        if (active) {
          setSlotsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug, selectedDate]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedSlot) {
      setSubmitError("Please choose a time slot.");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError("");
      const booking = await api.createPublicBooking(slug, {
        name: form.name,
        email: form.email,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startsAt: selectedSlot,
        answers: Object.entries(form.answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      });
      navigate(`/confirmation/${booking.booking_reference}`, {
        state: booking,
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (pageLoading) {
    return (
      <main className="public-shell">
        <p className="empty-state">Loading booking page...</p>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="public-shell">
        <section className="public-panel confirmation-panel">
          <span className="eyebrow">Booking unavailable</span>
          <h1>This booking page could not be loaded</h1>
          <p className="empty-state error">
            {loadError || "The link may be invalid or the event may be hidden."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="public-shell">
      <section className="public-panel profile-panel">
        <div className="avatar">{page.profile.name.slice(0, 1)}</div>
        <div>
          <h1>{page.profile.name}</h1>
          <p>{page.profile.tagline}</p>
        </div>
      </section>

      <section className="public-panel booking-panel">
        <div className="booking-hero">
          <span className="eyebrow">Book time</span>
          <h2>{page.eventType.title}</h2>
          <p>{page.eventType.description}</p>
          <div className="meta-row">
            <span>{page.eventType.duration_minutes} min</span>
            <span>{page.eventType.location_label}</span>
            <span>{page.eventType.timezone}</span>
          </div>
        </div>

        <div className="booking-grid">
          <div>
            <h3>Choose a day</h3>
            <div className="date-grid">
              {nextSevenDays().map((day) => {
                const value = day.format("YYYY-MM-DD");
                return (
                  <button
                    type="button"
                    key={value}
                    className={
                      value === selectedDate
                        ? "date-button active"
                        : "date-button"
                    }
                    onClick={() => {
                      setSelectedDate(value);
                      setSubmitError("");
                    }}
                  >
                    <span>{day.format("ddd")}</span>
                    <strong>{day.format("D")}</strong>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3>Available times</h3>
            <div className="slot-grid">
              {slotsLoading && (
                <p className="section-note">Loading available times...</p>
              )}
              {slots.map((slot) => (
                <button
                  type="button"
                  key={slot.startsAt}
                  className={
                    slot.startsAt === selectedSlot
                      ? "slot-button active"
                      : "slot-button"
                  }
                  onClick={() => {
                    setSelectedSlot(slot.startsAt);
                    setSubmitError("");
                  }}
                >
                  {slot.label}
                </button>
              ))}
              {!slotsLoading && !slots.length && (
                <p className="section-note">
                  No times available for this date.
                </p>
              )}
            </div>
          </div>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((current) => ({ ...current, name: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((current) => ({ ...current, email: e.target.value }))
                }
                required
              />
            </label>
            {page.questions.map((question) => (
              <label className="full-width" key={question.id}>
                {question.label}
                {question.field_type === "textarea" ? (
                  <textarea
                    rows="3"
                    required={question.is_required}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        answers: {
                          ...current.answers,
                          [question.id]: e.target.value,
                        },
                      }))
                    }
                  />
                ) : (
                  <input
                    required={question.is_required}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        answers: {
                          ...current.answers,
                          [question.id]: e.target.value,
                        },
                      }))
                    }
                  />
                )}
              </label>
            ))}
          </div>
          {loadError && <p className="empty-state error">{loadError}</p>}
          {submitError && <p className="empty-state error">{submitError}</p>}
          <button
            type="submit"
            className="primary-button"
            disabled={submitting || slotsLoading || !selectedSlot}
          >
            {submitting ? "Booking..." : "Confirm booking"}
          </button>
        </form>
      </section>
    </main>
  );
}
