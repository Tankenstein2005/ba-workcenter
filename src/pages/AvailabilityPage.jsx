import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAsync } from "../hooks/useAsync.js";
import { weekdayOptions } from "../utils/dates.js";

function formatOverrideDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function AvailabilityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState("");
  const loadEventTypes = useCallback(() => api.listEventTypes(), []);
  const loadSelectedEvent = useCallback(
    () => (selectedId ? api.getEventType(selectedId) : Promise.resolve(null)),
    [selectedId],
  );
  const {
    data: eventTypes,
    loading,
    error,
  } = useAsync(loadEventTypes);
  const {
    data: selectedEvent,
    loading: detailLoading,
    error: detailError,
  } = useAsync(loadSelectedEvent);

  useEffect(() => {
    if (!eventTypes?.length) return;

    const requestedId = searchParams.get("event");
    const fallbackId = String(eventTypes[0].id);
    const nextId = eventTypes.some(
      (eventType) => String(eventType.id) === requestedId,
    )
      ? requestedId
      : fallbackId;

    setSelectedId(nextId);

    if (requestedId === nextId) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("event", nextId);
    setSearchParams(nextParams, { replace: true });
  }, [eventTypes, searchParams, setSearchParams]);

  function handleSelect(id) {
    const value = String(id);
    setSelectedId(value);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("event", value);
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <span className="eyebrow">Availability</span>
          <h2>Review schedules and overrides</h2>
          <p>
            Use this screen as a quick audit page before handing the system to
            the client.
          </p>
        </div>
      </div>

      {loading && <p className="empty-state">Loading availability...</p>}
      {error && <p className="empty-state error">{error}</p>}

      {!loading && !eventTypes?.length && (
        <div className="empty-panel">
          <h3>No event types yet</h3>
          <p>Create an event before reviewing schedules and overrides.</p>
          <Link className="primary-button" to="/">
            Go to event types
          </Link>
        </div>
      )}

      {!!eventTypes?.length && (
        <div className="cards-stack">
          <article className="section-card">
            <div className="section-card-header">
              <div>
                <h3>Choose an event</h3>
                <p>Review the live booking rules for each event type.</p>
              </div>
            </div>
            <div className="pill-row">
              {eventTypes.map((eventType) => (
                <button
                  type="button"
                  key={eventType.id}
                  className={
                    String(eventType.id) === selectedId
                      ? "slot-button active"
                      : "slot-button"
                  }
                  onClick={() => handleSelect(eventType.id)}
                >
                  {eventType.title}
                </button>
              ))}
            </div>
          </article>

          {detailLoading && (
            <article className="section-card">
              <p className="empty-state">Loading event schedule...</p>
            </article>
          )}

          {detailError && (
            <article className="section-card">
              <p className="empty-state error">{detailError}</p>
            </article>
          )}

          {selectedEvent && !detailLoading && (
            <>
              <article className="section-card">
                <div className="section-card-header">
                  <div>
                    <h3>{selectedEvent.title}</h3>
                    <p>
                      {selectedEvent.duration_minutes} min |{" "}
                      {selectedEvent.location_label} | {selectedEvent.timezone}
                    </p>
                  </div>
                  <div className="card-actions">
                    <a
                      className="ghost-button"
                      href={selectedEvent.publicLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Preview
                    </a>
                    <Link
                      className="primary-button"
                      to={`/?edit=${selectedEvent.id}`}
                    >
                      Edit event
                    </Link>
                  </div>
                </div>
                <p className="section-note">
                  {selectedEvent.description || "No description yet."}
                </p>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Public link</span>
                    <a
                      href={selectedEvent.publicLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {selectedEvent.publicLink}
                    </a>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Questions</span>
                    <strong>{selectedEvent.questions.length}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Overrides</span>
                    <strong>{selectedEvent.overrides.length}</strong>
                  </div>
                </div>
              </article>

              <div className="two-column-grid">
                <article className="section-card">
                  <div className="section-card-header">
                    <div>
                      <h3>Weekly availability</h3>
                      <p>
                        {selectedEvent.availability.length} recurring time
                        windows
                      </p>
                    </div>
                  </div>
                  {!selectedEvent.availability.length && (
                    <p className="section-note">No recurring availability yet.</p>
                  )}
                  {selectedEvent.availability.map((item) => (
                    <div className="booking-row" key={item.id}>
                      <div>
                        <strong>{item.schedule_name}</strong>
                        <p>{weekdayOptions[item.weekday]?.label || "Day"}</p>
                      </div>
                      <div className="booking-row-meta">
                        <strong>
                          {item.start_time.slice(0, 5)} -{" "}
                          {item.end_time.slice(0, 5)}
                        </strong>
                        <span>{item.timezone}</span>
                      </div>
                    </div>
                  ))}
                </article>

                <article className="section-card">
                  <div className="section-card-header">
                    <div>
                      <h3>Date overrides</h3>
                      <p>Specific days that block or replace normal hours</p>
                    </div>
                  </div>
                  {!selectedEvent.overrides.length && (
                    <p className="section-note">No overrides added yet.</p>
                  )}
                  {selectedEvent.overrides.map((item) => (
                    <div className="booking-row" key={item.id}>
                      <div>
                        <strong>{formatOverrideDate(item.override_date)}</strong>
                        <p>{item.note || "No note added."}</p>
                      </div>
                      <div className="booking-row-meta">
                        {item.is_blocked ? (
                          <strong>Blocked</strong>
                        ) : (
                          <strong>
                            {item.start_time?.slice(0, 5)} -{" "}
                            {item.end_time?.slice(0, 5)}
                          </strong>
                        )}
                        <span>{item.timezone}</span>
                      </div>
                    </div>
                  ))}
                </article>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
