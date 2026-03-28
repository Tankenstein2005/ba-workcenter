import { useEffect, useState } from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { formatFriendly } from "../utils/dates.js";

export default function ConfirmationPage() {
  const { state } = useLocation();
  const { reference } = useParams();
  const [booking, setBooking] = useState(state || null);
  const [loading, setLoading] = useState(!state);
  const [error, setError] = useState("");

  useEffect(() => {
    if (state) {
      setBooking(state);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    api
      .getBooking(reference)
      .then((result) => {
        if (!active) return;
        setBooking(result);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reference, state]);

  return (
    <main className="public-shell">
      <section className="public-panel confirmation-panel">
        <span className="eyebrow">Booking confirmed</span>
        <h1>Meeting scheduled</h1>
        <p>Your client-facing flow is ready for demos and expansion.</p>
        {loading ? (
          <div className="confirmation-card">
            <p className="empty-state">Loading booking details...</p>
          </div>
        ) : booking ? (
          <div className="confirmation-card">
            <strong>{booking.event_title}</strong>
            <p>{formatFriendly(booking.starts_at)}</p>
            <span>Reference: {booking.booking_reference}</span>
          </div>
        ) : (
          <div className="confirmation-card">
            {error && <p className="empty-state error">{error}</p>}
            <span>Reference: {reference}</span>
          </div>
        )}
        <div className="card-actions centered-actions">
          {booking?.event_slug ? (
            <Link className="ghost-button" to={`/book/${booking.event_slug}`}>
              Reopen booking page
            </Link>
          ) : null}
          <Link className="primary-button" to="/">
            Return to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
