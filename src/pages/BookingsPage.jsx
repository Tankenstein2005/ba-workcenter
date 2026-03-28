import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { formatFriendly } from "../utils/dates.js";

function BookingList({ title, items, onCancel }) {
  return (
    <article className="section-card">
      <div className="section-card-header">
        <div>
          <h3>{title}</h3>
          <p>{items.length} bookings</p>
        </div>
      </div>
      {!items.length && <p className="section-note">Nothing here yet.</p>}
      {items.map((booking) => (
        <div className="booking-row" key={booking.booking_reference}>
          <div>
            <strong>{booking.event_title}</strong>
            <p>
              {booking.booker_name} | {booking.booker_email}
            </p>
            <span>{formatFriendly(booking.starts_at)}</span>
          </div>
          <div className="card-actions action-stack align-end">
            <Link className="ghost-button" to={`/book/${booking.event_slug}`}>
              View event
            </Link>
            {onCancel ? (
              <button
                type="button"
                className="ghost-button danger"
                onClick={() => onCancel(booking)}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </article>
  );
}

export default function BookingsPage() {
  const loadBookings = useCallback(() => api.listBookings(), []);
  const { data, loading, error, execute } = useAsync(
    loadBookings,
  );
  const [pendingCancel, setPendingCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleCancel() {
    if (!pendingCancel) return;

    try {
      setCancelling(true);
      await api.cancelBooking(
        pendingCancel.booking_reference,
        "Cancelled from dashboard",
      );
      setPendingCancel(null);
      setNotice(`Cancelled ${pendingCancel.event_title}.`);
      await execute();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <span className="eyebrow">Bookings</span>
          <h2>Track upcoming, past, and cancelled meetings</h2>
          <p>
            Cancellation is enabled here, and the API also supports rescheduling
            for a future client flow.
          </p>
        </div>
      </div>
      {notice && <p className="status-note">{notice}</p>}
      {loading && <p className="empty-state">Loading bookings...</p>}
      {error && <p className="empty-state error">{error}</p>}
      {data && (
        <div className="two-column-grid">
          <BookingList
            title="Upcoming"
            items={data.upcoming}
            onCancel={setPendingCancel}
          />
          <BookingList title="Past" items={data.past} />
          <BookingList title="Cancelled" items={data.cancelled} />
        </div>
      )}

      {pendingCancel && (
        <ConfirmDialog
          title="Cancel booking"
          description={`Cancel "${pendingCancel.event_title}" for ${pendingCancel.booker_name}?`}
          confirmLabel="Cancel booking"
          confirmTone="danger"
          busy={cancelling}
          onConfirm={handleCancel}
          onCancel={() => setPendingCancel(null)}
        />
      )}
    </section>
  );
}
